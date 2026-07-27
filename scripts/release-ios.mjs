#!/usr/bin/env node
/**
 * iOS App Store sürüm hazırlığı — ASC API
 *
 * Kullanım:
 *   node scripts/release-ios.mjs prepare   # 1.0.x sürümü + IAP review submission taslağı
 *   node scripts/release-ios.mjs status    # mevcut sürümler
 *
 * Ortam: web/.env → ASC_ISSUER_ID, ASC_KEY_ID, ASC_P8_PATH, ASC_APP_ID
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const API = "https://api.appstoreconnect.apple.com";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function loadEnv() {
  const envPath = path.join(ROOT, "web/.env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    const val = trimmed.slice(eq + 1);
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv();

const ISSUER_ID = process.env.ASC_ISSUER_ID || "";
const KEY_ID = process.env.ASC_KEY_ID || "";
const P8_PATH = process.env.ASC_P8_PATH || "";
const APP_ID = process.env.ASC_APP_ID || "6760871547";

const SUPPORT_IAP_IDS = [
  "ummet_support_tea",
  "ummet_support_standard",
  "ummet_support_generous",
];

const b64url = (buf) =>
  Buffer.from(buf).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

function fail(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

function readAppVersion() {
  const appJson = JSON.parse(fs.readFileSync(path.join(ROOT, "app.json"), "utf8"));
  return {
    version: appJson.expo.version,
    buildNumber: appJson.expo.ios?.buildNumber || "1",
  };
}

function makeToken() {
  if (!ISSUER_ID) fail("ASC_ISSUER_ID tanımlı değil (web/.env).");
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

async function listAppStoreVersions() {
  const { ok, json, text } = await api(
    `/v1/apps/${APP_ID}/appStoreVersions?filter[platform]=IOS&limit=20`,
  );
  if (!ok) fail(`Sürüm listesi alınamadı: ${text.slice(0, 400)}`);
  return json.data || [];
}

async function findOrCreateAppStoreVersion(versionString) {
  const versions = await listAppStoreVersions();
  const existing = versions.find((v) => v.attributes?.versionString === versionString);
  if (existing) {
    console.log(`✓ App Store sürümü zaten var: ${versionString} (${existing.attributes?.appStoreState})`);
    return existing;
  }

  const { ok, json, text } = await api("/v1/appStoreVersions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "appStoreVersions",
        attributes: {
          platform: "IOS",
          versionString,
        },
        relationships: {
          app: { data: { type: "apps", id: APP_ID } },
        },
      },
    }),
  });

  if (!ok) fail(`Sürüm oluşturulamadı: ${text.slice(0, 500)}`);
  console.log(`✓ App Store sürümü oluşturuldu: ${versionString}`);
  return json.data;
}

async function listSupportIaps() {
  const { ok, json, text } = await api(`/v1/apps/${APP_ID}/inAppPurchasesV2?limit=50`);
  if (!ok) fail(`IAP listesi alınamadı: ${text.slice(0, 400)}`);

  const byProduct = Object.fromEntries(
    (json.data || []).map((iap) => [iap.attributes.productId, iap]),
  );

  const missing = SUPPORT_IAP_IDS.filter((id) => !byProduct[id]);
  if (missing.length) fail(`ASC'de eksik IAP: ${missing.join(", ")}`);

  return SUPPORT_IAP_IDS.map((id) => byProduct[id]);
}

async function findOpenReviewSubmission() {
  const { ok, json } = await api(`/v1/apps/${APP_ID}/reviewSubmissions?filter[state]=READY_FOR_REVIEW&limit=5`);
  if (ok && json.data?.length) return json.data[0];

  const draft = await api(`/v1/apps/${APP_ID}/reviewSubmissions?filter[state]=WAITING_FOR_REVIEW&limit=5`);
  if (draft.ok && draft.json.data?.length) return draft.json.data[0];

  return null;
}

async function createReviewSubmission() {
  const existing = await findOpenReviewSubmission();
  if (existing) {
    console.log(`✓ Mevcut review submission kullanılıyor: ${existing.id}`);
    return existing;
  }

  const { ok, json, text } = await api("/v1/reviewSubmissions", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "reviewSubmissions",
        attributes: { platform: "IOS" },
        relationships: {
          app: { data: { type: "apps", id: APP_ID } },
        },
      },
    }),
  });

  if (!ok) fail(`Review submission oluşturulamadı: ${text.slice(0, 500)}`);
  console.log("✓ Yeni review submission oluşturuldu");
  return json.data;
}

async function getLatestInAppPurchaseVersion(iapId) {
  const { ok, json, text } = await api(`/v2/inAppPurchases/${iapId}/versions?limit=1`);
  if (!ok) fail(`IAP sürümü alınamadı: ${text.slice(0, 300)}`);
  const version = json.data?.[0];
  if (!version) fail(`IAP için sürüm bulunamadı: ${iapId}`);
  return version;
}

async function addSubmissionItem(submissionId, relationshipType, resourceId, resourceType = relationshipType) {
  const relationships = {
    reviewSubmission: { data: { type: "reviewSubmissions", id: submissionId } },
    [relationshipType]: { data: { type: resourceType, id: resourceId } },
  };

  const { ok, status, text } = await api("/v1/reviewSubmissionItems", {
    method: "POST",
    body: JSON.stringify({
      data: {
        type: "reviewSubmissionItems",
        relationships,
      },
    }),
  });

  if (ok) return true;
  if (status === 409) return false; // zaten ekli
  fail(`Submission item eklenemedi (${relationshipType}): ${text.slice(0, 400)}`);
}

async function cmdStatus() {
  const { version, buildNumber } = readAppVersion();
  console.log(`\n📱 Ümmet iOS — app.json: ${version} (build ${buildNumber})\n`);

  const versions = await listAppStoreVersions();
  for (const v of versions.slice(0, 8)) {
    console.log(
      `  ${v.attributes?.versionString} — ${v.attributes?.appStoreState} (id: ${v.id})`,
    );
  }

  console.log("");
  const iaps = await listSupportIaps();
  for (const iap of iaps) {
    console.log(`  IAP ${iap.attributes.productId} — ${iap.attributes.state}`);
  }
  console.log("");
}

async function cmdPrepare() {
  const { version, buildNumber } = readAppVersion();
  console.log(`\n🚀 iOS sürüm hazırlığı: ${version} (build ${buildNumber})\n`);

  const appStoreVersion = await findOrCreateAppStoreVersion(version);
  const iaps = await listSupportIaps();
  const submission = await createReviewSubmission();

  await addSubmissionItem(submission.id, "appStoreVersion", appStoreVersion.id, "appStoreVersions");
  console.log(`✓ Sürüm submission'a eklendi: ${version}`);

  for (const iap of iaps) {
    const iapVersion = await getLatestInAppPurchaseVersion(iap.id);
    const added = await addSubmissionItem(
      submission.id,
      "inAppPurchaseVersion",
      iapVersion.id,
      "inAppPurchaseVersions",
    );
    console.log(
      `${added ? "✓" : "·"} IAP submission'a eklendi: ${iap.attributes.productId}`,
    );
  }

  console.log(`
✅ ASC tarafı hazır.

Sıradaki adımlar (otomatik build):
  eas build --platform ios --profile production --non-interactive
  eas submit --platform ios --latest --non-interactive

Build yüklendikten sonra App Store Connect'te:
  1. Sürüm ${version} → build ${buildNumber} seçin
  2. Review submission'ı gönderin (veya: node scripts/release-ios.mjs submit)

Not: İlk consumable IAP'ler bu sürümle birlikte review'a gider.
`);
}

async function cmdSubmit() {
  const submission = await findOpenReviewSubmission();
  if (!submission) fail("Açık review submission bulunamadı. Önce prepare çalıştırın.");

  const { ok, text } = await api(`/v1/reviewSubmissions/${submission.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      data: {
        type: "reviewSubmissions",
        id: submission.id,
        attributes: { submitted: true },
      },
    }),
  });

  if (!ok) fail(`Review gönderilemedi: ${text.slice(0, 500)}`);
  console.log("\n✅ App Review'a gönderildi.\n");
}

const cmd = process.argv[2] || "prepare";

try {
  if (cmd === "status") await cmdStatus();
  else if (cmd === "prepare") await cmdPrepare();
  else if (cmd === "submit") await cmdSubmit();
  else fail(`Bilinmeyen komut: ${cmd}\nKullanım: status | prepare | submit`);
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}
