import { emotionsByName } from "@/data/emotions";
import { parseDiaryEmotionNames } from "@/lib/diary-emotion-parse";

export const PROFILE_JOURNAL_ENERGY_VALUES = [0, 1, 2, 3, 4, 5] as const;
export const PROFILE_JOURNAL_VALENCE_VALUES = [0, 1, 2, 3, 4, 5] as const;

export type ProfileJournalSortMode =
  | "date_desc"
  | "date_asc"
  | "energy_desc"
  | "energy_asc"
  | "valence_desc"
  | "valence_asc";

export type ProfileJournalFilter = {
  dateFrom: string;
  dateTo: string;
  /** Точное имя эмоции из справочника или пусто — любая */
  emotionName: string;
  energy: number | null;
  valence: number | null;
  tags: Set<string>;
};

export const EMPTY_PROFILE_JOURNAL_FILTER: ProfileJournalFilter = {
  dateFrom: "",
  dateTo: "",
  emotionName: "",
  energy: null,
  valence: null,
  tags: new Set(),
};

export type ProfileJournalListEntry = {
  id: string;
  emotion: string;
  text: string;
  date: string;
  createdAtMs: number;
  tags: string[];
  emotionNames: string[];
  energy: number | null;
  valence: number | null;
  visibleToTherapist: boolean;
  visibilityUpdating?: boolean;
};

function parseTags(raw?: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

/** Начало дня в локальной TZ (мс). */
function startOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

/** Конец дня в локальной TZ (мс). */
function endOfLocalDay(d: Date): number {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x.getTime();
}

/** ДД.ММ.ГГГГ → Date или null */
export function parseRuDateBoundary(
  value: string,
  endOfDay: boolean,
): number | null {
  const s = value.trim();
  if (!s) return null;
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const month = Number(m[2]) - 1;
  const year = Number(m[3]);
  const d = new Date(year, month, day);
  if (
    d.getFullYear() !== year ||
    d.getMonth() !== month ||
    d.getDate() !== day
  ) {
    return null;
  }
  return endOfDay ? endOfLocalDay(d) : startOfLocalDay(d);
}

/** ДД.ММ.ГГГГ → локальная полуночь или null */
export function parseRuDateStringToLocalDate(value: string): Date | null {
  const ms = parseRuDateBoundary(value.trim(), false);
  return ms === null ? null : new Date(ms);
}

/** Локальная дата → ДД.ММ.ГГГГ */
export function formatLocalDateRu(d: Date): string {
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

export function aggregateEnergyValence(emotionNames: string[]): {
  energy: number | null;
  valence: number | null;
} {
  let maxE: number | null = null;
  let maxV: number | null = null;
  for (const name of emotionNames) {
    const row = emotionsByName.get(name.trim());
    if (!row) continue;
    if (row.energy !== null && row.energy !== undefined) {
      maxE = maxE === null ? row.energy : Math.max(maxE, row.energy);
    }
    if (row.valence !== null && row.valence !== undefined) {
      maxV = maxV === null ? row.valence : Math.max(maxV, row.valence);
    }
  }
  return { energy: maxE, valence: maxV };
}

export function buildProfileJournalEntry(
  entry: {
    id: string;
    emotion?: string | null;
    thought?: string | null;
    situation?: string | null;
    tags?: string | null;
    visibility?: string | null;
    createdAt?: string | null;
  },
  formatDate: (iso?: string | null) => string,
): ProfileJournalListEntry {
  const createdAtMs = entry.createdAt
    ? new Date(entry.createdAt).getTime()
    : 0;
  const emotionNames = parseDiaryEmotionNames(entry.emotion);
  const { energy, valence } = aggregateEnergyValence(emotionNames);
  const tags = parseTags(entry.tags);
  const text =
    entry.thought?.trim() ||
    entry.situation?.trim() ||
    "Запись без текста";
  const emotionPreview =
    emotionNames[0]?.trim() ||
    (entry.emotion?.trim() ? entry.emotion.trim() : "") ||
    "Без названия эмоции";
  return {
    id: entry.id,
    emotion: emotionPreview,
    text,
    date: formatDate(entry.createdAt),
    createdAtMs: Number.isFinite(createdAtMs) ? createdAtMs : 0,
    tags,
    emotionNames,
    energy,
    valence,
    visibleToTherapist: entry.visibility === "THERAPIST",
    visibilityUpdating: false,
  };
}

function compareNullableNumberAsc(
  a: number | null,
  b: number | null,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

export function sortProfileJournalEntries(
  list: ProfileJournalListEntry[],
  mode: ProfileJournalSortMode,
): ProfileJournalListEntry[] {
  const next = [...list];
  switch (mode) {
    case "date_desc":
      next.sort((a, b) => b.createdAtMs - a.createdAtMs);
      break;
    case "date_asc":
      next.sort((a, b) => a.createdAtMs - b.createdAtMs);
      break;
    case "energy_desc":
      next.sort((a, b) => -compareNullableNumberAsc(a.energy, b.energy));
      break;
    case "energy_asc":
      next.sort((a, b) => compareNullableNumberAsc(a.energy, b.energy));
      break;
    case "valence_desc":
      next.sort((a, b) => -compareNullableNumberAsc(a.valence, b.valence));
      break;
    case "valence_asc":
      next.sort((a, b) => compareNullableNumberAsc(a.valence, b.valence));
      break;
    default:
      break;
  }
  return next;
}

export function applyProfileJournalFilter(
  list: ProfileJournalListEntry[],
  filter: ProfileJournalFilter,
): ProfileJournalListEntry[] {
  const fromMs = parseRuDateBoundary(filter.dateFrom, false);
  const toMs = parseRuDateBoundary(filter.dateTo, true);
  const emotionNeedle = filter.emotionName.trim();
  const emotionNorm = emotionNeedle.toLocaleLowerCase("ru");
  const needEnergy = filter.energy !== null && filter.energy !== undefined;
  const needValence = filter.valence !== null && filter.valence !== undefined;
  const tagNeedles = Array.from(filter.tags);

  return list.filter((e) => {
    if (fromMs !== null && e.createdAtMs < fromMs) return false;
    if (toMs !== null && e.createdAtMs > toMs) return false;

    if (emotionNorm.length > 0) {
      const hit = e.emotionNames.some(
        (n) => n.trim().toLocaleLowerCase("ru") === emotionNorm,
      );
      if (!hit) return false;
    }

    if (needEnergy) {
      if (e.energy !== filter.energy) return false;
    }
    if (needValence) {
      if (e.valence !== filter.valence) return false;
    }

    for (const t of tagNeedles) {
      const tn = t.trim().toLocaleLowerCase("ru");
      if (!tn) continue;
      const has = e.tags.some(
        (x) => x.trim().toLocaleLowerCase("ru") === tn,
      );
      if (!has) return false;
    }

    return true;
  });
}
