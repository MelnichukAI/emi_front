import { screenTopPadding } from "./screen-top-padding";

/** @deprecated Используйте {@link screenTopPadding} */
export function diaryScreenTopPadding(safeAreaTop: number): number {
  return screenTopPadding(safeAreaTop);
}

export { screenTopPadding };
