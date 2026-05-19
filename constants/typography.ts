import type { TextStyle } from "react-native";

/** Имена после useFonts из @expo-google-fonts/roboto */
export const FONT_FAMILIES = {
  regular: "Roboto_400Regular",
  medium: "Roboto_500Medium",
  semiBold: "Roboto_600SemiBold",
  bold: "Roboto_700Bold",
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

/** Полужирный (SemiBold 600) — для акцентов, кнопок, выделенных подписей. */
export const textSemiBold: TextStyle = {
  fontFamily: FONT_FAMILIES.semiBold,
  fontWeight: "600",
};

/** Жирный (Bold 700) — для крупных заголовков и сильных акцентов. */
export const textBold: TextStyle = {
  fontFamily: FONT_FAMILIES.bold,
  fontWeight: "700",
};
