import { Platform } from "react-native";

/**
 * Верхний отступ для экранов дневника (создание / подтверждение, сайдбар).
 * На вебе safe-area сверху обычно 0 — без нижней границы заголовок оказывается слишком высоко.
 */
export function diaryScreenTopPadding(safeAreaTop: number): number {
  const padded = safeAreaTop + 20;
  const minimum = Platform.OS === "web" ? 52 : 28;
  return Math.max(padded, minimum);
}
