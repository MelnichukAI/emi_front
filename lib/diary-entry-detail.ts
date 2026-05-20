export type DiaryEntryDetail = {
  id: string;
  situation?: string | null;
  thought?: string | null;
  reaction?: string | null;
  behavior?: string | null;
  behaviorAlt?: string | null;
  emotion?: string | null;
  tags?: string | null;
  createdAt?: string | null;
  date?: string | null;
};

export type EmotionRow = {
  text: string;
  percent: string;
};

export function normalizeEntryText(value?: string | null): string {
  return value?.trim() ?? "";
}

export function extractEmotionLines(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function parseEmotionRows(raw?: string | null): EmotionRow[] {
  const lines = extractEmotionLines(raw);
  const rows = lines.map((line) => {
    const trimmed = line.trim();
    const match = trimmed.match(/^(.*?)(?:\s+(\d+)%?)?$/);
    const name = match?.[1]?.trim() ?? "";
    const percent = match?.[2]?.trim() ?? "100";
    return { text: name, percent };
  });

  if (rows.length === 0) {
    return [{ text: "", percent: "100" }];
  }
  return rows;
}

export function toEmotionDisplayLines(items: EmotionRow[]): string[] {
  return items
    .map((item) => {
      const name = item.text.trim();
      const percent = item.percent.trim();
      if (!name) return "";
      return percent ? `${name} - ${percent}%` : name;
    })
    .filter((line) => line.length > 0);
}

export function extractEntryTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export function formatEntryDateShort(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}
