/** Общие хелперы для экрана статистики (клиент и терапевт по emotion-statistics / diary). */

export type DiaryStatEntry = {
  id?: string;
  emotion?: string | null;
  tags?: string | null;
  createdAt?: string | null;
  date?: string | null;
  reflection?: { stateChange?: unknown } | null;
};

export type StatRow = { label: string; count: number };

export function extractEmotionNames(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.replace(/\s*\d+%?$/g, "").trim())
    .filter(Boolean);
}

export function extractTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function toTopRows(counter: Map<string, number>, top = 5): StatRow[] {
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count }));
}

export function buildTopEmotionRows(entries: ReadonlyArray<DiaryStatEntry>): StatRow[] {
  const counter = new Map<string, number>();
  entries.forEach((entry) => {
    extractEmotionNames(entry.emotion).forEach((name) => {
      counter.set(name, (counter.get(name) ?? 0) + 1);
    });
  });
  return toTopRows(counter, 5);
}

export function buildTopTagRows(entries: ReadonlyArray<DiaryStatEntry>): StatRow[] {
  const counter = new Map<string, number>();
  entries.forEach((entry) => {
    extractTags(entry.tags).forEach((tag) => {
      counter.set(tag, (counter.get(tag) ?? 0) + 1);
    });
  });
  return toTopRows(counter, 5);
}

/** Записи для графиков валентности/энергии — как на клиентской статистике. */
export function toChartEntries(entries: ReadonlyArray<DiaryStatEntry>) {
  return entries.map((entry) => ({
    emotion: entry.emotion ?? null,
    createdAt: entry.createdAt ?? entry.date ?? null,
  }));
}

export function reflectionsFromEntries(
  entries: ReadonlyArray<DiaryStatEntry>,
): Array<{ stateChange?: unknown }> {
  return entries
    .map((entry) => entry.reflection)
    .filter((r): r is NonNullable<DiaryStatEntry["reflection"]> => Boolean(r));
}
