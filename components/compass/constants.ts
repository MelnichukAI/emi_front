export const COMPASS_GRID_SIZE = 6;

export const COMPASS_CARD_PADDING = 18;

/** Верхняя граница ширины карточки компаса (широкие экраны / веб-демо). */
export const COMPASS_CARD_MAX_WIDTH = 500;

/** Максимальный размер квадратной сетки 6×6 с учётом внутренних отступов карточки. */
export const COMPASS_MAX_GRID_SIZE =
  COMPASS_CARD_MAX_WIDTH - COMPASS_CARD_PADDING * 2;

/** Ограничивает размер компаса, сохраняя квадрат 6×6 на узких и широких экранах. */
export function resolveCompassSize(availableWidth: number): number {
  return Math.min(Math.max(availableWidth, 0), COMPASS_MAX_GRID_SIZE);
}

export const COMPASS_OUTER_RADIUS = 0;

export const COMPASS_SELECTION_INSET = 3;

export const COMPASS_MAX_SELECTED_CELLS = 10;

export const COMPASS_MAX_SUGGESTED_EMOTIONS = 20;