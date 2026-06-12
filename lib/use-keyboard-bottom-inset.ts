import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform, type KeyboardEvent } from "react-native";

/**
 * Полоска подсказок Gboard/Samsung над клавиатурой.
 * На Android с edge-to-edge + resize часто не входит в endCoordinates.height.
 */
export const ANDROID_IME_ACCESSORY_INSET = 52;

function computeAndroidKeyboardInset(event: KeyboardEvent): number {
  const { screenY, height } = event.endCoordinates;
  const windowHeight = Dimensions.get("window").height;

  // Расстояние от низа окна приложения до верхней границы IME.
  const geometryGap = Math.max(0, windowHeight - screenY);

  // resize уже сжал окно: достаточно учесть панель подсказок и мелкую погрешность.
  if (geometryGap < height * 0.25) {
    return ANDROID_IME_ACCESSORY_INSET + geometryGap;
  }

  // Полный подъём: клавиатура не вошла в resize окна.
  return Math.max(geometryGap, height) + ANDROID_IME_ACCESSORY_INSET;
}

/** Дополнительный нижний отступ панели ввода над IME на Android (APK, edge-to-edge). */
export function useKeyboardBottomInset(): number {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const onShow = (event: KeyboardEvent) => {
      setInset(computeAndroidKeyboardInset(event));
    };
    const onHide = () => setInset(0);

    const showSub = Keyboard.addListener("keyboardDidShow", onShow);
    const hideSub = Keyboard.addListener("keyboardDidHide", onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return inset;
}
