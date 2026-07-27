const appJson = require("./app.json");

// .env.local → extra.revenueCat (native build'de process.env bazen boş kalabiliyor)
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    plugins: ["expo-dev-client", ...(appJson.expo.plugins ?? [])],
    extra: {
      ...appJson.expo.extra,
      eas: {
        ...(appJson.expo.extra?.eas ?? {}),
        projectId: "940a4321-861d-4e41-85d3-13970d1f3314",
      },
      revenueCat: {
        iosApiKey: process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY || "",
        androidApiKey: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY || "",
      },
    },
  },
};
