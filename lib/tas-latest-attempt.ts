import { apiRequest, ApiRequestError } from "@/lib/api";
import type { OaeScoreSummary } from "@/lib/oae-score-session";

function num(o: Record<string, unknown>, ...keys: string[]): number | undefined {
  for (const key of keys) {
    const raw = o[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim()) {
      const n = Number(raw);
      if (Number.isFinite(n)) return n;
    }
  }
  return undefined;
}

function scoreFromRecord(o: Record<string, unknown>): OaeScoreSummary | null {
  // DIF — Difficulty Identifying Feelings (трудности с определением чувств).
  const identifyFeelings = num(
    o,
    "difScore",
    "dif_score",
    "dif",
    "identifyFeelings",
    "identify_feelings",
    "identifyFeelingsScore",
    "identify_feelings_score",
  );
  // DDF — Difficulty Describing Feelings (трудности с описанием чувств).
  const describeFeelings = num(
    o,
    "ddfScore",
    "ddf_score",
    "ddf",
    "describeFeelings",
    "describe_feelings",
    "describeFeelingsScore",
    "describe_feelings_score",
  );
  // EOT — Externally Oriented Thinking (внешне ориентированное мышление).
  const externalThinking = num(
    o,
    "eotScore",
    "eot_score",
    "eot",
    "externalThinking",
    "external_thinking",
    "externalThinkingScore",
    "external_thinking_score",
  );
  let total = num(o, "totalScore", "total_score", "total", "sum");

  if (
    identifyFeelings === undefined ||
    describeFeelings === undefined ||
    externalThinking === undefined
  ) {
    return null;
  }

  if (total === undefined) {
    total = identifyFeelings + describeFeelings + externalThinking;
  }

  if (!Number.isFinite(total)) return null;

  return {
    identifyFeelings,
    describeFeelings,
    externalThinking,
    total,
  };
}

/**
 * Разбор ответа GET /tas/attempts/latest (формат полей может отличаться на бэке).
 */
export function parseTasLatestAttempt(data: unknown): OaeScoreSummary | null {
  if (!data || typeof data !== "object") return null;
  const root = data as Record<string, unknown>;

  const nestedKeys = [
    "result",
    "data",
    "attempt",
    "payload",
    "scores",
    "score",
    "latest",
  ] as const;

  const candidates: Record<string, unknown>[] = [root];
  for (const key of nestedKeys) {
    const v = root[key];
    if (v && typeof v === "object" && !Array.isArray(v)) {
      candidates.push(v as Record<string, unknown>);
    }
  }

  for (const o of candidates) {
    const direct = scoreFromRecord(o);
    if (direct) return direct;
    for (const subKey of ["subscales", "breakdown", "dimensions"]) {
      const inner = o[subKey];
      if (inner && typeof inner === "object" && !Array.isArray(inner)) {
        const fromInner = scoreFromRecord(inner as Record<string, unknown>);
        if (fromInner) return fromInner;
      }
    }
  }

  return null;
}

/**
 * Последняя попытка TAS с сервера. 404 / сеть / неизвестный формат — null (без throw).
 */
export async function fetchLatestTasScore(
  token: string,
): Promise<OaeScoreSummary | null> {
  try {
    const data = await apiRequest<unknown>("/tas/attempts/latest", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return parseTasLatestAttempt(data);
  } catch (e) {
    if (e instanceof ApiRequestError && e.status === 404) return null;
    return null;
  }
}
