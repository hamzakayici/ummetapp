#!/usr/bin/env node
/**
 * App Store Connect — Destek IAP kurulumu
 *
 * Ürünler MISSING_METADATA durumundayken RevenueCat import etmez.
 * Bu script eksik localization + review screenshot'ı tamamlar.
 *
 * Kullanım:
 *   node scripts/iap-setup.mjs check     # durum raporu
 *   node scripts/iap-setup.mjs fix       # metadata tamamla
 *   node scripts/iap-setup.mjs revenuecat # RevenueCat adımlarını yazdır
 *
 * Ortam (web/.env veya export):
 *   ASC_ISSUER_ID, ASC_KEY_ID, ASC_P8_PATH, ASC_APP_ID
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API = "https://api.appstoreconnect.apple.com";

const ISSUER_ID = process.env.ASC_ISSUER_ID || "";
const KEY_ID = process.env.ASC_KEY_ID || "";
const P8_PATH = process.env.ASC_P8_PATH || "";
const APP_ID = process.env.ASC_APP_ID || "6760871547";
const SCREENSHOT_PATH =
  process.env.IAP_SCREENSHOT_PATH ||
  path.join(process.cwd(), "scripts/assets/iap-review-screenshot.png");

const PRODUCTS = [
  {
    productId: "ummet_support_tea",
    name: "Bir çay ısmarla",
    price: "29.99",
  },
  {
    productId: "ummet_support_standard",
    name: "Destek ol",
    price: "79.99",
  },
  {
    productId: "ummet_support_generous",
    name: "Cömert destek",
    price: "199.99",
  },
];

const DESCRIPTION = "Ümmet uygulamasının geliştirilmesine gönüllü destek.";

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function makeToken() {
  if (!ISSUER_ID) fail("ASC_ISSUER_ID tanımlı değil.");
  if (!fs.existsSync(P8_PATH)) fail(`.p8 dosyası bulunamadı: ${P8_PATH}`);

  const privateKey = fs.readFileSync(P8_PATH, "utf8");
  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({ iss: ISSUER_ID, iat: now, exp: now + 15 * 60, aud: "appstoreconnect-v1" }),
  );
  const signature = crypto.sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });
  return `${header}.${payload}.${b64url(signature)}`;
}

async function api(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API}${pathOrUrl}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${makeToken()}`,
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = { raw: text };
  }
  return { ok: res.ok, status: res.status, json, text };
}

async function listIaps() {
  const { ok, json } = await api(`/v1/apps/${APP_ID}/inAppPurchasesV2?limit=50`);
  if (!ok) fail("IAP listesi alınamadı.");
  return json.data || [];
}

async function diagnoseIap(iap) {
  const id = iap.id;
  const productId = iap.attributes.productId;
  const [loc, sc, prices] = await Promise.all([
    api(`/v2/inAppPurchases/${id}/inAppPurchaseLocalizations`),
    api(`/v2/inAppPurchases/${id}/appStoreReviewScreenshot`),
    api(`/v1/inAppPurchasePriceSchedules/${id}/manualPrices?include=inAppPurchasePricePoint`),
  ]);

  const localizationCount = loc.json?.data?.length || 0;
  const deliveryState = sc.json?.data?.attributes?.assetDeliveryState?.state;
  const hasScreenshot =
    deliveryState === "UPLOAD_COMPLETE" || deliveryState === "COMPLETE";
  const price = prices.json?.included?.[0]?.attributes?.customerPrice || "—";

  return {
    id,
    productId,
    state: iap.attributes.state,
    localizationCount,
    hasScreenshot,
    price,
  };
}

async function ensureLocalization(iapId, name) {
  const existing = await api(`/v2/inAppPurchases/${iapId}/inAppPurchaseLocalizations`);
  const locales = (existing.json?.data || []).map((l) => l.attributes?.locale);
  const needed = ["tr", "en-US"];

  for (const locale of needed) {
    if (locales.includes(locale)) continue;

    const body = {
      data: {
        type: "inAppPurchaseLocalizations",
        attributes: {
          name,
          description: DESCRIPTION,
          locale,
        },
        relationships: {
          inAppPurchaseV2: {
            data: { type: "inAppPurchases", id: iapId },
          },
        },
      },
    };

    const res = await api("/v1/inAppPurchaseLocalizations", {
      method: "POST",
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      fail(`Localization (${locale}) eklenemedi: ${res.text.slice(0, 400)}`);
    }
    console.log(`  ✓ ${locale} localization eklendi`);
  }
}

async function uploadReviewScreenshot(iapId) {
  const existing = await api(`/v2/inAppPurchases/${iapId}/appStoreReviewScreenshot`);
  const deliveryState = existing.json?.data?.attributes?.assetDeliveryState?.state;
  if (deliveryState === "UPLOAD_COMPLETE" || deliveryState === "COMPLETE") {
    console.log("  ✓ review screenshot hazır");
    return;
  }

  if (existing.json?.data?.id) {
    await api(`/v1/inAppPurchaseAppStoreReviewScreenshots/${existing.json.data.id}`, {
      method: "DELETE",
    });
  }

  if (!fs.existsSync(SCREENSHOT_PATH)) {
    fail(`Screenshot dosyası yok: ${SCREENSHOT_PATH}`);
  }

  const fileBuffer = fs.readFileSync(SCREENSHOT_PATH);
  const fileName = path.basename(SCREENSHOT_PATH);
  const checksum = crypto.createHash("md5").update(fileBuffer).digest("hex");

  const reserve = await api("/v1/inAppPurchaseAppStoreReviewScreenshots", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "inAppPurchaseAppStoreReviewScreenshots",
        attributes: {
          fileName,
          fileSize: fileBuffer.length,
        },
        relationships: {
          inAppPurchaseV2: {
            data: { type: "inAppPurchases", id: iapId },
          },
        },
      },
    }),
  });

  if (!reserve.ok) {
    fail(`Screenshot rezervasyonu başarısız: ${reserve.text.slice(0, 500)}`);
  }

  const screenshotId = reserve.json.data.id;
  const uploadOps = reserve.json.data.attributes?.uploadOperations || [];

  for (const op of uploadOps) {
    const chunk = fileBuffer.subarray(op.offset, op.offset + op.length);
    const uploadRes = await fetch(op.url, {
      method: op.method || "PUT",
      headers: Object.fromEntries((op.requestHeaders || []).map((h) => [h.name, h.value])),
      body: chunk,
    });

    if (!uploadRes.ok) {
      fail(`Screenshot yüklenemedi: HTTP ${uploadRes.status}`);
    }
  }

  const commit = await api(`/v1/inAppPurchaseAppStoreReviewScreenshots/${screenshotId}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "inAppPurchaseAppStoreReviewScreenshots",
        id: screenshotId,
        attributes: {
          uploaded: true,
          sourceFileChecksum: checksum,
        },
      },
    }),
  });

  if (!commit.ok) {
    fail(`Screenshot commit başarısız: ${commit.text.slice(0, 400)}`);
  }

  console.log("  ✓ review screenshot yüklendi");
}

async function cmdCheck() {
  console.log("\n📋 Destek IAP durumu\n");
  const iaps = await listIaps();
  const byProduct = Object.fromEntries(
    PRODUCTS.map((p) => [p.productId, p]),
  );

  for (const iap of iaps) {
    const productId = iap.attributes.productId;
    if (!byProduct[productId]) continue;
    const d = await diagnoseIap(iap);
    const issues = [];
    if (d.localizationCount === 0) issues.push("localization yok");
    if (!d.hasScreenshot) issues.push("screenshot yok");
    if (d.state === "MISSING_METADATA") issues.push("MISSING_METADATA");
    if (d.state === "READY_TO_SUBMIT") issues.length = 0;

    console.log(`${productId}`);
    console.log(`  durum: ${d.state}`);
    console.log(`  fiyat: ₺${d.price}`);
    console.log(`  localization: ${d.localizationCount}`);
    console.log(`  screenshot: ${d.hasScreenshot ? "var" : "yok"}`);
    console.log(`  sorun: ${issues.length ? issues.join(", ") : "yok ✓"}`);
    console.log("");
  }
}

async function cmdFix() {
  console.log("\n🔧 IAP metadata tamamlanıyor...\n");
  const iaps = await listIaps();
  const wanted = new Set(PRODUCTS.map((p) => p.productId));

  for (const iap of iaps) {
    const productId = iap.attributes.productId;
    if (!wanted.has(productId)) continue;

    const meta = PRODUCTS.find((p) => p.productId === productId);
    console.log(`→ ${productId} (${meta.name})`);

    await ensureLocalization(iap.id, meta.name);
    await uploadReviewScreenshot(iap.id);
    console.log("");
  }

  console.log("✅ Tamamlandı. Durumu kontrol edin:\n  node scripts/iap-setup.mjs check\n");
}

function cmdRevenueCat() {
  console.log(`
📦 RevenueCat kurulumu (panel — otomatik import için)

1. RevenueCat → Project Settings → API keys
   • Yeni V2 Secret Key oluştur (project_configuration:products:read_write)
   • web/.env → REVENUECAT_SECRET_API_KEY=

2. RevenueCat → Apps → iOS app (com.ummet.app)
   • App Store Connect API key yükle (.p8 + Issuer ID)

3. Product catalog → Products → + New → Import products
   • ummet_support_tea
   • ummet_support_standard
   • ummet_support_generous

4. Offerings → support → Current (mavi tik) + her paketi App Store ürününe bağla

5. Mobil SDK key (Test Store DEĞİL):
   RevenueCat → API keys → iOS public key (appl_...)
   .env.local → EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=appl_...

6. Yeniden derle:
   npx expo run:ios --device
`);
}

const cmd = process.argv[2] || "check";

try {
  if (cmd === "check") await cmdCheck();
  else if (cmd === "fix") await cmdFix();
  else if (cmd === "revenuecat") cmdRevenueCat();
  else fail(`Bilinmeyen komut: ${cmd}\nKullanım: check | fix | revenuecat`);
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
