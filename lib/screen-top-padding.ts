import { Platform } from "react-native";

/** Дополнительный отступ под safe-area до первого контента. */
const EXTRA_BELOW_SAFE = 28;

/** Минимальный paddingTop (safe-area + extra), если insets.top ≈ 0 (часто веб). */
const MIN_TOTAL_TOP = Platform.OS === "web" ? 64 : 44;

/**
 * Верхний отступ экрана: safe-area + фиксированный зазор.
 * Используйте для Header, ScrollView и кастомных шапок.
 */
export function screenTopPadding(safeAreaTop: number): number {
  return Math.max(safeAreaTop + EXTRA_BELOW_SAFE, MIN_TOTAL_TOP);
}
