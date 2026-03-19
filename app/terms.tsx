import { useEffect } from "react";
import { Linking } from "react-native";
import { router } from "expo-router";

const TERMS_URL = "https://ummetapp.com/terms";

export default function TermsScreen() {
  useEffect(() => {
    Linking.openURL(TERMS_URL).catch(() => {});
    router.back();
  }, []);

  return null;
}
