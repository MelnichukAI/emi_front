import type { Emotion } from "@/data/emotions";

/** Восемь базовых эмоций (уровень 1 в справочнике). */
export const EMOTION_DICTIONARY_BASE_EMOTIONS = [
  "Грусть",
  "Доверие",
  "Злость",
  "Отвращение",
  "Предвкушение",
  "Радость",
  "Страх",
  "Удивление",
] as const;

export type EmotionDictionaryBaseEmotion =
  (typeof EMOTION_DICTIONARY_BASE_EMOTIONS)[number];

export const EMOTION_DICTIONARY_ENERGY_VALUES = [0, 1, 2, 3, 4, 5] as const;

export const EMOTION_DICTIONARY_VALENCE_VALUES = [0, 1, 2, 3, 4, 5] as const;

/** Колонка «Тип» в данных. */
export const EMOTION_DICTIONARY_CATEGORIES = [
  "Чувство",
  "Состояние",
  "Эмоция",
  "Настроение",
] as const;

export type EmotionDictionaryCategory =
  (typeof EMOTION_DICTIONARY_CATEGORIES)[number];

export const EMOTION_DICTIONARY_POLARITIES = [
  "Позитивная",
  "Негативная",
] as const;

export type EmotionDictionaryPolarity =
  (typeof EMOTION_DICTIONARY_POLARITIES)[number];

export type EmotionDictionaryFilter = {
  baseEmotion: string | null;
  energy: number | null;
  valence: number | null;
  category: string | null;
  polarity: EmotionDictionaryPolarity | null;
  /** Имя эмоции из справочника; должно совпадать с одной из похожих у записи. */
  similarName: string | null;
};

export const EMPTY_EMOTION_DICTIONARY_FILTER: EmotionDictionaryFilter = {
  baseEmotion: null,
  energy: null,
  valence: null,
  category: null,
  polarity: null,
  similarName: null,
};

export function applyEmotionDictionaryFilter(
  list: Emotion[],
  filter: EmotionDictionaryFilter,
): Emotion[] {
  return list.filter((e) => {
    if (filter.baseEmotion) {
      const b = filter.baseEmotion.trim();
      const m1 = e.baseEmotion1.trim() === b;
      const m2 = e.baseEmotion2.trim() === b;
      if (!m1 && !m2) return false;
    }
    if (filter.energy !== null && filter.energy !== undefined) {
      if (e.energy !== filter.energy) return false;
    }
    if (filter.valence !== null && filter.valence !== undefined) {
      if (e.valence !== filter.valence) return false;
    }
    if (filter.category) {
      if (e.category.trim() !== filter.category.trim()) return false;
    }
    if (filter.polarity) {
      if (e.polarity.trim() !== filter.polarity) return false;
    }
    if (filter.similarName) {
      const target = filter.similarName.trim();
      const sims = [e.similar1, e.similar2, e.similar3].map((s) => s.trim());
      if (!sims.includes(target)) return false;
    }
    return true;
  });
}
