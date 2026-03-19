import { useEffect } from "react";
import { Linking } from "react-native";
import { router } from "expo-router";

const PRIVACY_URL = "https://ummetapp.com/privacy.html";

export default function PrivacyScreen() {
  useEffect(() => {
    Linking.openURL(PRIVACY_URL).catch(() => {});
    router.back();
  }, []);

  return null;
}
