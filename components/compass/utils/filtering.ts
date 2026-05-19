import {
  COMPASS_MAX_SUGGESTED_EMOTIONS,
} from "../constants";

import type {
  CompassSelectedCell,
} from "../types";

import {
  emotions,
  type Emotion,
} from "@/data/emotions";

import {
  applyEmotionDictionaryFilter,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";

export const filterEmotionsByCompassCells = (
  source: Emotion[],
  selectedCells: CompassSelectedCell[],
): Emotion[] => {
  if (selectedCells.length === 0) {
    return [];
  }

  return source.filter((emotion) => {
    if (
      emotion.energy === null ||
      emotion.valence === null
    ) {
      return false;
    }

    return selectedCells.some(
      (cell) =>
        cell.energy === emotion.energy &&
        cell.valence === emotion.valence,
    );
  });
};

export const applyCompassEmotionLimit = (
  source: Emotion[],
): Emotion[] => {
  return source.slice(
    0,
    COMPASS_MAX_SUGGESTED_EMOTIONS,
  );
};

export const getCompassSuggestedEmotions = (
  selectedCells: CompassSelectedCell[],
  filter: EmotionDictionaryFilter,
): Emotion[] => {
  const byCells = filterEmotionsByCompassCells(
    emotions,
    selectedCells,
  );

  const filtered =
    applyEmotionDictionaryFilter(
      byCells,
      filter,
    );

  return applyCompassEmotionLimit(filtered);
};