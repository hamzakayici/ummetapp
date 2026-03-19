const { withXcodeProject, withEntitlementsPlist, withDangerousMod } = require("@expo/config-plugins");
const path = require("path");
const fs = require("fs");

const WIDGET_NAME = "UmmetWidget";
const WIDGET_BUNDLE_ID = "com.ummet.app.widget";
const TEAM_ID = "WZ3W8Y7U6Z";

function withWidget(config) {
  // 1. Widget dosyalarını ios/ klasörüne kopyala
  config = withDangerousMod(config, [
    "ios",
    async (mod) => {
      const root = mod.modRequest.projectRoot;
      const widgetDir = path.join(root, "ios", WIDGET_NAME);
      fs.mkdirSync(widgetDir, { recursive: true });

      // Swift kaynak dosyasını kopyala
      const srcFile = path.join(root, "targets", "widget", "UmmetWidget.swift");
      if (fs.existsSync(srcFile)) {
        fs.copyFileSync(srcFile, path.join(widgetDir, "UmmetWidget.swift"));
      }

      // Widget entitlements (boş)
      fs.writeFileSync(
        path.join(widgetDir, `${WIDGET_NAME}.entitlements`),
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
</dict>
</plist>`
      );

      // Widget Info.plist
      fs.writeFileSync(
        path.join(widgetDir, "Info.plist"),
        `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>Ümmet</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>$(PRODUCT_BUNDLE_PACKAGE_TYPE)</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.widgetkit-extension</string>
  </dict>
</dict>
</plist>`
      );

      return mod;
    },
  ]);

  // 2. Xcode projesine widget target ekle
  config = withXcodeProject(config, (mod) => {
    const proj = mod.modResults;
    const objects = proj.hash.project.objects;

    // UUID'ler oluştur
    const targetUuid = proj.generateUuid();
    const productUuid = proj.generateUuid();
    const buildConfigListUuid = proj.generateUuid();
    const debugConfigUuid = proj.generateUuid();
    const releaseConfigUuid = proj.generateUuid();
    const sourcesBuildPhaseUuid = proj.generateUuid();
    const frameworksBuildPhaseUuid = proj.generateUuid();
    const swiftFileRefUuid = proj.generateUuid();
    const swiftBuildFileUuid = proj.generateUuid();
    const groupUuid = proj.generateUuid();
    const containerItemProxyUuid = proj.generateUuid();
    const targetDependencyUuid = proj.generateUuid();
    const copyFilesPhaseUuid = proj.generateUuid();
    const embedBuildFileUuid = proj.generateUuid();

    // Ortak build settings
    const commonBuildSettings = {
      ASSETCATALOG_COMPILER_GLOBAL_ACCENT_COLOR_NAME: "AccentColor",
      CLANG_ANALYZER_NONNULL: "YES",
      CLANG_ANALYZER_NUMBER_OBJECT_CONVERSION: "YES_AGGRESSIVE",
      CLANG_CXX_LANGUAGE_STANDARD: '"gnu++20"',
      CLANG_ENABLE_OBJC_WEAK: "YES",
      CLANG_WARN_DOCUMENTATION_COMMENTS: "YES",
      CLANG_WARN_QUOTED_INCLUDE_IN_FRAMEWORK_HEADER: "YES",
      CLANG_WARN_UNGUARDED_AVAILABILITY: "YES_AGGRESSIVE",
      CODE_SIGN_STYLE: "Automatic",
      CURRENT_PROJECT_VERSION: "1",
      DEVELOPMENT_TEAM: TEAM_ID,
      GCC_C_LANGUAGE_STANDARD: "gnu17",
      GENERATE_INFOPLIST_FILE: "NO",
      INFOPLIST_FILE: `"${WIDGET_NAME}/Info.plist"`,
      IPHONEOS_DEPLOYMENT_TARGET: "16.0",
      LOCALIZATION_PREFERS_STRING_CATALOGS: "YES",
      MARKETING_VERSION: "1.0.0",
      PRODUCT_BUNDLE_IDENTIFIER: `"${WIDGET_BUNDLE_ID}"`,
      PRODUCT_NAME: `"$(TARGET_NAME)"`,
      SKIP_INSTALL: "YES",
      SWIFT_EMIT_LOC_STRINGS: "YES",
      SWIFT_VERSION: "5.0",
      TARGETED_DEVICE_FAMILY: '"1,2"',
      CODE_SIGN_ENTITLEMENTS: `"${WIDGET_NAME}/${WIDGET_NAME}.entitlements"`,
    };

    // Debug build config
    objects.XCBuildConfiguration[debugConfigUuid] = {
      isa: "XCBuildConfiguration",
      buildSettings: { ...commonBuildSettings, DEBUG_INFORMATION_FORMAT: '"dwarf-with-dsym"', MTL_ENABLE_DEBUG_INFO: "INCLUDE_SOURCE", SWIFT_OPTIMIZATION_LEVEL: '"-Onone"' },
      name: "Debug",
    };
    objects.XCBuildConfiguration[`${debugConfigUuid}_comment`] = "Debug";

    // Release build config
    objects.XCBuildConfiguration[releaseConfigUuid] = {
      isa: "XCBuildConfiguration",
      buildSettings: { ...commonBuildSettings, SWIFT_OPTIMIZATION_LEVEL: '"-Owholemodule"', COPY_PHASE_STRIP: "NO" },
      name: "Release",
    };
    objects.XCBuildConfiguration[`${releaseConfigUuid}_comment`] = "Release";

    // Configuration list
    objects.XCConfigurationList[buildConfigListUuid] = {
      isa: "XCConfigurationList",
      buildConfigurations: [
        { value: debugConfigUuid, comment: "Debug" },
        { value: releaseConfigUuid, comment: "Release" },
      ],
      defaultConfigurationIsVisible: 0,
      defaultConfigurationName: "Release",
    };
    objects.XCConfigurationList[`${buildConfigListUuid}_comment`] = `Build configuration list for PBXNativeTarget "${WIDGET_NAME}"`;

    // Swift file reference
    objects.PBXFileReference[swiftFileRefUuid] = {
      isa: "PBXFileReference",
      lastKnownFileType: "sourcecode.swift",
      path: "UmmetWidget.swift",
      sourceTree: '"<group>"',
    };
    objects.PBXFileReference[`${swiftFileRefUuid}_comment`] = "UmmetWidget.swift";

    // Product reference
    objects.PBXFileReference[productUuid] = {
      isa: "PBXFileReference",
      explicitFileType: '"wrapper.app-extension"',
      includeInIndex: 0,
      path: `"${WIDGET_NAME}.appex"`,
      sourceTree: "BUILT_PRODUCTS_DIR",
    };
    objects.PBXFileReference[`${productUuid}_comment`] = `${WIDGET_NAME}.appex`;

    // Build file for Swift source
    objects.PBXBuildFile[swiftBuildFileUuid] = {
      isa: "PBXBuildFile",
      fileRef: swiftFileRefUuid,
      fileRef_comment: "UmmetWidget.swift",
    };
    objects.PBXBuildFile[`${swiftBuildFileUuid}_comment`] = "UmmetWidget.swift in Sources";

    // Sources build phase
    objects.PBXSourcesBuildPhase[sourcesBuildPhaseUuid] = {
      isa: "PBXSourcesBuildPhase",
      buildActionMask: 2147483647,
      files: [
        { value: swiftBuildFileUuid, comment: "UmmetWidget.swift in Sources" },
      ],
      runOnlyForDeploymentPostprocessing: 0,
    };
    objects.PBXSourcesBuildPhase[`${sourcesBuildPhaseUuid}_comment`] = "Sources";

    // Frameworks build phase
    objects.PBXFrameworksBuildPhase[frameworksBuildPhaseUuid] = {
      isa: "PBXFrameworksBuildPhase",
      buildActionMask: 2147483647,
      files: [],
      runOnlyForDeploymentPostprocessing: 0,
    };
    objects.PBXFrameworksBuildPhase[`${frameworksBuildPhaseUuid}_comment`] = "Frameworks";

    // PBX Group for widget files
    objects.PBXGroup[groupUuid] = {
      isa: "PBXGroup",
      children: [
        { value: swiftFileRefUuid, comment: "UmmetWidget.swift" },
      ],
      path: WIDGET_NAME,
      sourceTree: '"<group>"',
    };
    objects.PBXGroup[`${groupUuid}_comment`] = WIDGET_NAME;

    // Ana gruba ekle
    const mainGroupId = proj.getFirstProject().firstProject.mainGroup;
    const mainGroup = objects.PBXGroup[mainGroupId];
    if (mainGroup) {
      mainGroup.children.push({ value: groupUuid, comment: WIDGET_NAME });
    }

    // Products grubuna ekle
    const prodGroupId = proj.pbxGroupByName("Products")
      ? Object.keys(objects.PBXGroup).find((k) => {
          const g = objects.PBXGroup[k];
          return g && typeof g === "object" && g.name === "Products";
        })
      : null;
    if (prodGroupId) {
      objects.PBXGroup[prodGroupId].children.push({
        value: productUuid,
        comment: `${WIDGET_NAME}.appex`,
      });
    }

    // Native target
    objects.PBXNativeTarget[targetUuid] = {
      isa: "PBXNativeTarget",
      buildConfigurationList: buildConfigListUuid,
      buildConfigurationList_comment: `Build configuration list for PBXNativeTarget "${WIDGET_NAME}"`,
      buildPhases: [
        { value: sourcesBuildPhaseUuid, comment: "Sources" },
        { value: frameworksBuildPhaseUuid, comment: "Frameworks" },
      ],
      buildRules: [],
      dependencies: [],
      name: `"${WIDGET_NAME}"`,
      productName: `"${WIDGET_NAME}"`,
      productReference: productUuid,
      productReference_comment: `${WIDGET_NAME}.appex`,
      productType: '"com.apple.product-type.app-extension"',
    };
    objects.PBXNativeTarget[`${targetUuid}_comment`] = WIDGET_NAME;

    // Projenin targets listesine ekle
    const projectObj = proj.getFirstProject().firstProject;
    projectObj.targets.push({ value: targetUuid, comment: WIDGET_NAME });

    // Container item proxy (main app → widget dependency)
    objects.PBXContainerItemProxy = objects.PBXContainerItemProxy || {};
    objects.PBXContainerItemProxy[containerItemProxyUuid] = {
      isa: "PBXContainerItemProxy",
      containerPortal: projectObj.isa ? proj.getFirstProject().uuid : proj.hash.project.rootObject,
      containerPortal_comment: "Project object",
      proxyType: 1,
      remoteGlobalIDString: targetUuid,
      remoteInfo: `"${WIDGET_NAME}"`,
    };
    objects.PBXContainerItemProxy[`${containerItemProxyUuid}_comment`] = "PBXContainerItemProxy";

    // Target dependency
    objects.PBXTargetDependency = objects.PBXTargetDependency || {};
    objects.PBXTargetDependency[targetDependencyUuid] = {
      isa: "PBXTargetDependency",
      target: targetUuid,
      target_comment: WIDGET_NAME,
      targetProxy: containerItemProxyUuid,
      targetProxy_comment: "PBXContainerItemProxy",
    };
    objects.PBXTargetDependency[`${targetDependencyUuid}_comment`] = "PBXTargetDependency";

    // Ana app target'a dependency ekle
    const mainTargetKey = Object.keys(objects.PBXNativeTarget).find((k) => {
      const t = objects.PBXNativeTarget[k];
      return t && typeof t === "object" && t.productType === '"com.apple.product-type.application"';
    });
    if (mainTargetKey) {
      objects.PBXNativeTarget[mainTargetKey].dependencies.push({
        value: targetDependencyUuid,
        comment: "PBXTargetDependency",
      });

      // Embed App Extensions — Copy Files build phase
      const embedBuildFile = proj.generateUuid();
      objects.PBXBuildFile[embedBuildFile] = {
        isa: "PBXBuildFile",
        fileRef: productUuid,
        fileRef_comment: `${WIDGET_NAME}.appex`,
        settings: { ATTRIBUTES: ["RemoveHeadersOnCopy"] },
      };
      objects.PBXBuildFile[`${embedBuildFile}_comment`] = `${WIDGET_NAME}.appex in Embed Foundation Extensions`;

      objects.PBXCopyFilesBuildPhase = objects.PBXCopyFilesBuildPhase || {};
      objects.PBXCopyFilesBuildPhase[copyFilesPhaseUuid] = {
        isa: "PBXCopyFilesBuildPhase",
        buildActionMask: 2147483647,
        dstPath: '""',
        dstSubfolderSpec: 13,
        files: [
          { value: embedBuildFile, comment: `${WIDGET_NAME}.appex in Embed Foundation Extensions` },
        ],
        name: '"Embed Foundation Extensions"',
        runOnlyForDeploymentPostprocessing: 0,
      };
      objects.PBXCopyFilesBuildPhase[`${copyFilesPhaseUuid}_comment`] = "Embed Foundation Extensions";

      objects.PBXNativeTarget[mainTargetKey].buildPhases.push({
        value: copyFilesPhaseUuid,
        comment: "Embed Foundation Extensions",
      });
    }

    return mod;
  });

  return config;
}

module.exports = withWidget;
