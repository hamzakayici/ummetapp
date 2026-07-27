#!/usr/bin/env node
/**
 * App Store Connect — Analytics Reports API istemcisi
 *
 * Bağımlılık yok (Node 18+ yeterli: fetch, crypto, zlib yerleşik).
 *
 * Kurulum — bu üç değeri ortam değişkeni olarak verin:
 *   export ASC_ISSUER_ID="....-....-....-...."      # Users and Access > Integrations
 *   export ASC_KEY_ID="XXXXXXXXXX"                  # key tablosundaki 10 karakter
 *   export ASC_P8_PATH="~/.ummet-secrets/AuthKey_XXXXXXXXXX.p8"
 *
 * Bu depo herkese AÇIK — kimlik bilgileri koda gömülmez.
 *
 * Kullanım:
 *   node scripts/appstore-analytics.mjs check            # kimlik doğrulamayı test et
 *   node scripts/appstore-analytics.mjs request          # rapor talebi oluştur (bir kez)
 *   node scripts/appstore-analytics.mjs list             # talep/rapor/örnek durumunu göster
 *   node scripts/appstore-analytics.mjs fetch [KATEGORI] # üretilmiş raporları indir
 *
 * Kategoriler: APP_USAGE, APP_STORE_ENGAGEMENT, COMMERCE, FRAMEWORK_USAGE, PERFORMANCE
 *
 * NOT: Analytics Reports API anlık değil. `request` bir talep oluşturur, Apple raporları
 * saatler içinde üretir. Sonra `list` ile kontrol edip `fetch` ile indirin.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const API = "https://api.appstoreconnect.apple.com";

const ISSUER_ID = process.env.ASC_ISSUER_ID || "";
const KEY_ID = process.env.ASC_KEY_ID || "";
const P8_PATH = process.env.ASC_P8_PATH || "";
const APP_ID = process.env.ASC_APP_ID || "6760871547";
const OUT_DIR = process.env.ASC_OUT_DIR || path.join(process.cwd(), "data", "appstore");

// ─── JWT (ES256) ──────────────────────────────────────────────

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function makeToken() {
  const missing = [
    !ISSUER_ID && "ASC_ISSUER_ID",
    !KEY_ID && "ASC_KEY_ID",
    !P8_PATH && "ASC_P8_PATH",
  ].filter(Boolean);

  if (missing.length > 0) {
    fail(
      `Eksik ortam değişkeni: ${missing.join(", ")}\n\n` +
        "Değerler App Store Connect > Users and Access > Integrations sayfasında.\n" +
        "Örnek:\n" +
        '  export ASC_ISSUER_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"\n' +
        '  export ASC_KEY_ID="XXXXXXXXXX"\n' +
        '  export ASC_P8_PATH="$HOME/.ummet-secrets/AuthKey_XXXXXXXXXX.p8"',
    );
  }

  if (!fs.existsSync(P8_PATH)) fail(`.p8 dosyası bulunamadı: ${P8_PATH}`);

  const privateKey = fs.readFileSync(P8_PATH, "utf8");
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ alg: "ES256", kid: KEY_ID, typ: "JWT" }));
  const payload = b64url(
    JSON.stringify({
      iss: ISSUER_ID,
      iat: now,
      exp: now + 15 * 60, // ASC üst sınırı 20 dk
      aud: "appstoreconnect-v1",
    }),
  );

  // JOSE ES256 ham R||S imza ister; Node varsayılanı DER, o yüzden ieee-p1363.
  const signature = crypto.sign("sha256", Buffer.from(`${header}.${payload}`), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  });

  return `${header}.${payload}.${b64url(signature)}`;
}

// ─── HTTP ─────────────────────────────────────────────────────

async function api(pathOrUrl, options = {}) {
  const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${API}${pathOrUrl}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${makeToken()}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  if (!res.ok) {
    let detail = text;
    try {
      const parsed = JSON.parse(text);
      detail = (parsed.errors || [])
        .map((e) => `  • [${e.status}] ${e.title}: ${e.detail || ""}`)
        .join("\n") || text;
    } catch {}
    fail(`API hatası (${res.status}) ${url}\n${detail}`);
  }
  return text ? JSON.parse(text) : null;
}

// ─── Komutlar ─────────────────────────────────────────────────

async function cmdCheck() {
  const app = await api(`/v1/apps/${APP_ID}`);
  const a = app.data.attributes;
  ok("Kimlik doğrulama başarılı.");
  console.log(`  Uygulama : ${a.name}`);
  console.log(`  Bundle   : ${a.bundleId}`);
  console.log(`  SKU      : ${a.sku}`);
  console.log(`  App ID   : ${app.data.id}`);
}

async function listRequests() {
  const res = await api(`/v1/apps/${APP_ID}/analyticsReportRequests`);
  return res.data || [];
}

async function cmdRequest() {
  const accessType = (process.argv[3] || "ONE_TIME_SNAPSHOT").toUpperCase();

  const existing = await listRequests();
  const already = existing.find((r) => r.attributes.accessType === accessType);
  if (already) {
    ok(`Zaten bir ${accessType} talebi var (id: ${already.id}). Yeni talep oluşturulmadı.`);
    return;
  }

  const res = await api("/v1/analyticsReportRequests", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "analyticsReportRequests",
        attributes: { accessType },
        relationships: { app: { data: { type: "apps", id: APP_ID } } },
      },
    }),
  });

  ok(`${accessType} rapor talebi oluşturuldu (id: ${res.data.id}).`);
  console.log("  Apple raporları üretmeye başlayacak — genelde birkaç saat sürer.");
  console.log("  Daha sonra:  node scripts/appstore-analytics.mjs list");
}

async function cmdList() {
  const requests = await listRequests();
  if (requests.length === 0) {
    console.log("Henüz rapor talebi yok. Önce: node scripts/appstore-analytics.mjs request");
    return;
  }

  for (const req of requests) {
    const { accessType, stoppedDueToInactivity } = req.attributes;
    console.log(`\n▸ Talep ${req.id} — ${accessType}${stoppedDueToInactivity ? " (durduruldu)" : ""}`);

    const reports = await api(`/v1/analyticsReportRequests/${req.id}/reports?limit=200`);
    if (!reports.data?.length) {
      console.log("  Henüz rapor üretilmemiş. Apple'ın işlemesini bekleyin (birkaç saat).");
      continue;
    }

    const byCategory = {};
    for (const r of reports.data) {
      (byCategory[r.attributes.category] ||= []).push(r);
    }
    for (const [category, list] of Object.entries(byCategory)) {
      console.log(`  ${category} (${list.length} rapor)`);
      for (const r of list) console.log(`    - ${r.attributes.name}  [${r.id}]`);
    }
  }
}

async function cmdFetch() {
  const wantCategory = (process.argv[3] || "").toUpperCase();
  const requests = await listRequests();
  if (requests.length === 0) fail("Rapor talebi yok. Önce `request` komutunu çalıştırın.");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  let downloaded = 0;

  for (const req of requests) {
    const q = wantCategory ? `&filter[category]=${wantCategory}` : "";
    const reports = await api(`/v1/analyticsReportRequests/${req.id}/reports?limit=200${q}`);

    for (const report of reports.data || []) {
      const { name, category } = report.attributes;
      const instances = await api(`/v1/analyticsReports/${report.id}/instances?limit=200`);

      for (const inst of instances.data || []) {
        const { granularity, processingDate } = inst.attributes;
        const segments = await api(`/v1/analyticsReportInstances/${inst.id}/segments`);

        for (const [i, seg] of (segments.data || []).entries()) {
          const safeName = name.replace(/[^\w.-]+/g, "_");
          const file = path.join(
            OUT_DIR,
            `${category}__${safeName}__${granularity}__${processingDate}${i ? `__${i}` : ""}.tsv`,
          );

          const res = await fetch(seg.attributes.url); // imzalı URL, Authorization gerekmez
          if (!res.ok) {
            console.warn(`  ! indirilemedi: ${safeName} (${res.status})`);
            continue;
          }
          const gz = Buffer.from(await res.arrayBuffer());
          const tsv = zlib.gunzipSync(gz);
          fs.writeFileSync(file, tsv);
          downloaded++;
          console.log(`  ✓ ${path.basename(file)}  (${(tsv.length / 1024).toFixed(0)} KB)`);
        }
      }
    }
  }

  if (downloaded === 0) {
    console.log("İndirilecek hazır rapor bulunamadı. Apple henüz üretmemiş olabilir.");
  } else {
    ok(`${downloaded} dosya indirildi → ${OUT_DIR}`);
  }
}

// ─── Yardımcılar ──────────────────────────────────────────────

function fail(msg) {
  console.error(`\n✖ ${msg}\n`);
  process.exit(1);
}
function ok(msg) {
  console.log(`\n✔ ${msg}`);
}

const COMMANDS = { check: cmdCheck, request: cmdRequest, list: cmdList, fetch: cmdFetch };

const cmd = process.argv[2];
if (!cmd || !COMMANDS[cmd]) {
  console.log(`Kullanım: node scripts/appstore-analytics.mjs <check|request|list|fetch>`);
  process.exit(cmd ? 1 : 0);
}
await COMMANDS[cmd]();
