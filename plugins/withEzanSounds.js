const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Ezan seslerini HER İKİ platformun bundle'ına dahil eder.
 *
 * iOS     : .caf dosyaları Xcode projesine kopyalanır, pbxproj'a resource eklenir.
 * Android : .mp3 dosyaları android/app/src/main/res/raw/ altına kopyalanır.
 *
 * ⚠️ Android'de özel bildirim sesi doğrudan bildirime verilemez — Android 8+
 * sesi BİLDİRİM KANALINA bağlar ve kanal oluşturulduktan sonra sesi
 * değiştirilemez. Kanal tanımları: src/services/notificationChannels.ts
 *
 * ⚠️ res/raw dosya adları yalnızca küçük harf, rakam ve alt çizgi içerebilir.
 */
function withIosEzanSounds(config) {
  return withDangerousMod(config, [
    "ios",
    async (config) => {
      const soundFiles = [
        "ezan_fajr.caf",
        "ezan_dhuhr.caf",
        "ezan_asr.caf",
        "ezan_maghrib.caf",
        "ezan_isha.caf",
      ];

      const soundsDir = path.resolve(__dirname, "../assets/sounds");
      const projectName = config.modRequest.projectName;
      const iosProjectDir = path.join(config.modRequest.platformProjectRoot, projectName);
      const pbxprojPath = path.join(
        config.modRequest.platformProjectRoot,
        `${projectName}.xcodeproj`,
        "project.pbxproj"
      );

      // 1. Dosyaları iOS proje klasörüne kopyala
      for (const file of soundFiles) {
        const src = path.join(soundsDir, file);
        const dest = path.join(iosProjectDir, file);
        if (fs.existsSync(src)) {
          fs.copyFileSync(src, dest);
        }
      }

      // 2. pbxproj dosyasını düzenle — resource olarak ekle
      if (fs.existsSync(pbxprojPath)) {
        let pbxproj = fs.readFileSync(pbxprojPath, "utf8");

        // Zaten eklenmiş mi kontrol et
        if (!pbxproj.includes("ezan_fajr.caf")) {
          // Her ses dosyası için unique ID'ler oluştur
          const entries = soundFiles.map((file, i) => {
            const fileRefId = `EZ${String(i).padStart(6, "0")}01`;
            const buildFileId = `EZ${String(i).padStart(6, "0")}02`;
            return { file, fileRefId, buildFileId };
          });

          // PBXFileReference bölümüne ekle
          const fileRefMarker = "/* End PBXFileReference section */";
          const fileRefs = entries
            .map(
              (e) =>
                `\t\t${e.fileRefId} /* ${e.file} */ = {isa = PBXFileReference; lastKnownFileType = audio.caf; name = "${e.file}"; path = "${projectName}/${e.file}"; sourceTree = "<group>"; };`
            )
            .join("\n");

          pbxproj = pbxproj.replace(
            fileRefMarker,
            fileRefs + "\n" + fileRefMarker
          );

          // PBXBuildFile bölümüne ekle
          const buildFileMarker = "/* End PBXBuildFile section */";
          const buildFiles = entries
            .map(
              (e) =>
                `\t\t${e.buildFileId} /* ${e.file} in Resources */ = {isa = PBXBuildFile; fileRef = ${e.fileRefId} /* ${e.file} */; };`
            )
            .join("\n");

          pbxproj = pbxproj.replace(
            buildFileMarker,
            buildFiles + "\n" + buildFileMarker
          );

          // PBXResourcesBuildPhase bölümüne ekle
          const resourcesPattern = /\/\* Resources \*\/ = \{[\s\S]*?files = \(\n/;
          const match = pbxproj.match(resourcesPattern);
          if (match) {
            const resourceEntries = entries
              .map(
                (e) => `\t\t\t\t${e.buildFileId} /* ${e.file} in Resources */,`
              )
              .join("\n");

            pbxproj = pbxproj.replace(
              match[0],
              match[0] + resourceEntries + "\n"
            );
          }

          fs.writeFileSync(pbxprojPath, pbxproj, "utf8");
        }
      }

      return config;
    },
  ]);
}

/** Ezan mp3'lerini Android res/raw altına kopyalar */
function withAndroidEzanSounds(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const soundFiles = [
        "ezan_fajr.mp3",
        "ezan_dhuhr.mp3",
        "ezan_asr.mp3",
        "ezan_maghrib.mp3",
        "ezan_isha.mp3",
      ];

      const soundsDir = path.resolve(__dirname, "../assets/sounds");
      const rawDir = path.join(
        config.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "raw"
      );

      fs.mkdirSync(rawDir, { recursive: true });

      for (const file of soundFiles) {
        const src = path.join(soundsDir, file);
        if (!fs.existsSync(src)) {
          console.warn(`[withEzanSounds] Android sesi bulunamadi: ${file}`);
          continue;
        }
        fs.copyFileSync(src, path.join(rawDir, file));
      }

      return config;
    },
  ]);
}

module.exports = function withEzanSounds(config) {
  return withAndroidEzanSounds(withIosEzanSounds(config));
};
