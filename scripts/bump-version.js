#!/usr/bin/env node

/**
 * Sürüm Güncelleme Scripti
 * 
 * Kullanım:
 *   node scripts/bump-version.js patch   → 1.0.0 → 1.0.1
 *   node scripts/bump-version.js minor   → 1.0.0 → 1.1.0
 *   node scripts/bump-version.js major   → 1.0.0 → 2.0.0
 * 
 * Bu script:
 *   1. app.json'daki version ve ios.buildNumber'ı günceller
 *   2. package.json'daki version'ı günceller
 *   3. Değişiklikleri otomatik commit eder
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const appJsonPath = path.join(rootDir, 'app.json');
const packageJsonPath = path.join(rootDir, 'package.json');

const type = process.argv[2] || 'patch';

if (!['patch', 'minor', 'major'].includes(type)) {
  console.error('Kullanım: node scripts/bump-version.js [patch|minor|major]');
  process.exit(1);
}

// Dosyaları oku
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const currentVersion = appJson.expo.version;
const [major, minor, patch] = currentVersion.split('.').map(Number);

// Yeni sürüm hesapla
let newVersion;
switch (type) {
  case 'major': newVersion = `${major + 1}.0.0`; break;
  case 'minor': newVersion = `${major}.${minor + 1}.0`; break;
  case 'patch': newVersion = `${major}.${minor}.${patch + 1}`; break;
}

// Build number hesapla (her seferde 1 artar)
const currentBuild = parseInt(appJson.expo.ios?.buildNumber || '0', 10);
const newBuild = (currentBuild + 1).toString();

// app.json güncelle
appJson.expo.version = newVersion;
if (!appJson.expo.ios) appJson.expo.ios = {};
appJson.expo.ios.buildNumber = newBuild;
if (!appJson.expo.android) appJson.expo.android = {};
appJson.expo.android.versionCode = currentBuild + 1;

// package.json güncelle
packageJson.version = newVersion;

// Dosyalara yaz
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2) + '\n');
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`\n✅ Sürüm güncellendi!`);
console.log(`   ${currentVersion} → ${newVersion}`);
console.log(`   Build: ${currentBuild || 0} → ${newBuild}`);
console.log(`   iOS buildNumber: ${newBuild}`);
console.log(`   Android versionCode: ${currentBuild + 1}\n`);

// Git commit
try {
  execSync('git add app.json package.json', { cwd: rootDir });
  execSync(`git commit -m "chore: sürüm ${newVersion} (build ${newBuild})"`, { cwd: rootDir });
  console.log(`📦 Commit oluşturuldu: sürüm ${newVersion} (build ${newBuild})`);
} catch {
  console.log('⚠️  Git commit yapılamadı. Manuel commit gerekebilir.');
}
