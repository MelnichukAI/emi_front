import { FONT_FAMILIES } from "@/constants/typography";
import { registerRobotoTextDefaults } from "@/lib/register-roboto-defaults";
import {
  Roboto_400Regular,
  Roboto_500Medium,
  useFonts,
} from "@expo-google-fonts/roboto";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform } from "react-native";

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
  });

  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (!fontsReady) return;
    if (fontsLoaded) {
      registerRobotoTextDefaults();
    }
    if (Platform.OS === "web") {
      if (typeof document !== "undefined") {
        document.documentElement.style.fontFamily = `${FONT_FAMILIES.regular}, sans-serif`;
      }
    }
    void SplashScreen.hideAsync();
  }, [fontsLoaded, fontError, fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}
