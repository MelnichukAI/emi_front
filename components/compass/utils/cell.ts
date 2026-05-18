import { COMPASS_MAX_SELECTED_CELLS } from "../constants";
import type { CompassSelectedCell } from "../types";

export const getCompassCellKey = (
  valence: number,
  energy: number,
): string => {
  return `${valence}-${energy}`;
};

export const isCompassCellSelected = (
  selectedCells: CompassSelectedCell[],
  valence: number,
  energy: number,
): boolean => {
  return selectedCells.some(
    (cell) =>
      cell.valence === valence &&
      cell.energy === energy,
  );
};


export const toggleCompassCell = (
  selectedCells: CompassSelectedCell[],
  valence: number,
  energy: number,
): CompassSelectedCell[] => {
  const alreadySelected = isCompassCellSelected(
    selectedCells,
    valence,
    energy,
  );

  if (alreadySelected) {
    return selectedCells.filter(
      (cell) =>
        !(
          cell.valence === valence &&
          cell.energy === energy
        ),
    );
  }

  if (selectedCells.length >= COMPASS_MAX_SELECTED_CELLS) {
    return selectedCells;
  }

  return [
    ...selectedCells,
    {
      valence,
      energy,
    },
  ];
};