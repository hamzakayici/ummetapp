const { withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

/**
 * Ezan .wav dosyalarını iOS bundle'a dahil eder.
 * withDangerousMod ile dosyaları iOS proje klasörüne kopyalar
 * ve pbxproj dosyasını düzenleyerek resource olarak ekler.
 */
function withEzanSounds(config) {
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

module.exports = withEzanSounds;
