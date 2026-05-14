/** Разбор поля `emotion` записи дневника (строка с запятыми, опционально «%»). */

export function parseDiaryEmotionNames(raw?: string | null): string[] {
  if (!raw?.trim()) return [];
  const chunks = raw.split(",").map((c) => c.trim()).filter(Boolean);
  const names: string[] = [];
  for (const chunk of chunks) {
    const m = chunk.match(/^(.*?)(?:\s+(\d+)%?)?$/);
    const name = (m?.[1] ?? "").trim();
    if (name.length > 0) names.push(name);
  }
  return names;
}
