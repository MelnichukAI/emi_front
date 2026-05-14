import type { TextStyle } from "react-native";

/** Имена после useFonts из @expo-google-fonts/roboto */
export const FONT_FAMILIES = {
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
} as const;

/** Обычный текст */
export const textBody: TextStyle = {
  fontFamily: FONT_FAMILIES.regular,
};

/** Заголовки (Medium) */
export const textHeading: TextStyle = {
  fontFamily: FONT_FAMILIES.medium,
  fontWeight: "500",
};

/** Между regular и semibold — то же начертание Medium (кнопки, подписи) */
export const textMedium: TextStyle = { ...textHeading };
