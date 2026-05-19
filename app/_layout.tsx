import { FONT_FAMILIES } from "@/constants/typography";
import { hydrateAuthSession } from "@/lib/auth-session";
import { registerRobotoTextDefaults } from "@/lib/register-roboto-defaults";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  useFonts,
} from "@expo-google-fonts/roboto";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
  });
  const [authReady, setAuthReady] = useState(false);

  const fontsReady = fontsLoaded || fontError !== null;
  const appReady = fontsReady && authReady;

  useEffect(() => {
    void hydrateAuthSession().finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!appReady) return;
    if (fontsLoaded) {
      registerRobotoTextDefaults();
    }
    if (Platform.OS === "web") {
      if (typeof document !== "undefined") {
        document.documentElement.style.fontFamily = `${FONT_FAMILIES.regular}, sans-serif`;
      }
    }
    void SplashScreen.hideAsync();
  }, [appReady, fontsLoaded]);

  if (!appReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
