/**
 * Моковые данные персональной статистики пользователя.
 * Позже этот модуль можно заменить на запрос к API (например GET /statistics/me)
 * с теми же типами ответа.
 */

export type EmotionStat = {
  emotion: string;
  count: number;
};

export type TagStat = {
  tag: string;
  count: number;
};

export type FeedbackEffectivenessStat = {
  label: string;
  /** Доля в процентах (0–100) */
  percent: number;
};

/** Сводка статистики по одному пользователю (персональные данные). */
export type UserStatistics = {
  /** Заглушка под id пользователя с бэка */
  userId: string;
  topEmotions: EmotionStat[];
  topTags: TagStat[];
  /** Общее количество записей в дневнике */
  totalEntries: number;
  /** Среднее число записей за неделю */
  avgEntriesPerWeek: number;
  /** Распределение обратной связи после записей */
  appEffectiveness: FeedbackEffectivenessStat[];
};

/**
 * Временные данные. После интеграции с бэком:
 * заменить на результат хука/запроса и убрать этот экспорт.
 */
export const mockUserStatistics: UserStatistics = {
  userId: "mock-user-1",
  topEmotions: [
    { emotion: "Тревога", count: 18 },
    { emotion: "Радость", count: 14 },
    { emotion: "Грусть", count: 11 },
    { emotion: "Злость", count: 7 },
    { emotion: "Спокойствие", count: 6 },
  ],
  topTags: [
    { tag: "Работа", count: 22 },
    { tag: "Стресс", count: 15 },
    { tag: "Семья", count: 12 },
    { tag: "Усталость", count: 9 },
    { tag: "Сон", count: 5 },
  ],
  totalEntries: 47,
  avgEntriesPerWeek: 3.2,
  appEffectiveness: [
    { label: "Легче", percent: 32 },
    { label: "Немного легче", percent: 21 },
    { label: "Без изменений", percent: 26 },
    { label: "Хуже", percent: 9 },
    { label: "Пропущено", percent: 12 },
  ],
};
