export type FeedbackStateChange =
  | "BETTER"
  | "SLIGHTLY_BETTER"
  | "NO_CHANGE"
  | "WORSE"
  | "SKIPPED";

export const FEEDBACK_STATE_LABELS: Record<FeedbackStateChange, string> = {
  BETTER: "Легче",
  SLIGHTLY_BETTER: "Немного легче",
  NO_CHANGE: "Без изменений",
  WORSE: "Хуже",
  SKIPPED: "Пропущено",
};

export const FEEDBACK_STATE_ORDER: FeedbackStateChange[] = [
  "BETTER",
  "SLIGHTLY_BETTER",
  "NO_CHANGE",
  "WORSE",
  "SKIPPED",
];

export type ReflectionStatRow = {
  label: string;
  count: number;
};

export function isFeedbackStateChange(
  value: unknown,
): value is FeedbackStateChange {
  return (
    value === "BETTER" ||
    value === "SLIGHTLY_BETTER" ||
    value === "NO_CHANGE" ||
    value === "WORSE" ||
    value === "SKIPPED"
  );
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Понедельник 00:00 локальной даты. */
function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + offset);
  return d;
}

function weekStartKey(date: Date): number {
  return startOfWeekMonday(date).getTime();
}

/**
 * Среднее «за неделю»: для каждой календарной недели (пн–вс) считаем
 * (число записей / 7), затем усредняем по всем неделям от первой записи до текущей.
 * Дни без записей учитываются через деление на 7, а не на число активных дней.
 */
export function computeAvgEntriesPerWeek(
  entries: ReadonlyArray<{ createdAt?: string | null }>,
): number | null {
  const dated = entries.filter((e) => {
    if (!e.createdAt) return false;
    return !Number.isNaN(new Date(e.createdAt).getTime());
  });

  if (dated.length === 0) return null;

  const countByWeek = new Map<number, number>();
  dated.forEach((e) => {
    const key = weekStartKey(new Date(e.createdAt!));
    countByWeek.set(key, (countByWeek.get(key) ?? 0) + 1);
  });

  const firstEntryMs = Math.min(
    ...dated.map((e) => new Date(e.createdAt!).getTime()),
  );
  const firstWeek = startOfWeekMonday(new Date(firstEntryMs));
  const lastWeek = startOfWeekMonday(new Date());

  const weeklyRates: number[] = [];
  for (
    let cursor = firstWeek.getTime();
    cursor <= lastWeek.getTime();
    cursor += 7 * MS_PER_DAY
  ) {
    const sum = countByWeek.get(cursor) ?? 0;
    weeklyRates.push(sum / 7);
  }

  if (weeklyRates.length === 0) return null;

  const avg =
    weeklyRates.reduce((acc, n) => acc + n, 0) / weeklyRates.length;
  return Math.round(avg * 10) / 10;
}

/** Доли ответов обратной связи в процентах (0–100) для горизонтальных шкал. */
export function buildFeedbackEffectivenessRows(
  reflections: ReadonlyArray<{ stateChange?: unknown }>,
): ReflectionStatRow[] {
  const counter = new Map<FeedbackStateChange, number>();
  for (const key of FEEDBACK_STATE_ORDER) {
    counter.set(key, 0);
  }

  reflections.forEach((item) => {
    const raw = item.stateChange;
    const key: FeedbackStateChange = isFeedbackStateChange(raw)
      ? raw
      : "SKIPPED";
    counter.set(key, (counter.get(key) ?? 0) + 1);
  });

  const total = reflections.length;
  if (total === 0) {
    return FEEDBACK_STATE_ORDER.map((key) => ({
      label: FEEDBACK_STATE_LABELS[key],
      count: 0,
    }));
  }

  return FEEDBACK_STATE_ORDER.map((key) => {
    const n = counter.get(key) ?? 0;
    const percent = Math.round((n / total) * 100);
    return {
      label: FEEDBACK_STATE_LABELS[key],
      count: percent,
    };
  });
}
