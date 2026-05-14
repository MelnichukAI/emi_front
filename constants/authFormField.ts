import { colors } from "@/constants/colors";
import { textBody } from "@/constants/typography";
import type { TextStyle, ViewStyle } from "react-native";

/** Размер текста в полях (ввод и placeholder) — для подписей рядом с полями тот же размер. */
export const AUTH_FORM_TEXT_SIZE = 16;

/** Общая «оболочка» поля входа/регистрации (фон + скругление + обрезка содержимого). */
export const authFieldShell: ViewStyle = {
  backgroundColor: colors.card,
  borderRadius: 12,
  overflow: "hidden",
};

/** Текстовая часть внутри оболочки (без своего фона — рисует shell). */
export const authFieldInput: TextStyle = {
  ...textBody,
  paddingVertical: 12,
  paddingHorizontal: 12,
  color: colors.text,
  fontSize: AUTH_FORM_TEXT_SIZE,
  backgroundColor: "transparent",
};
