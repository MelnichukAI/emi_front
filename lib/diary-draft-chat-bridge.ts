import type { DiaryDraftFormState, DiaryEmotionRow } from "@/lib/diary-draft-context";

let pendingContext: string | null = null;

/** Сохранить текст контекста перед переходом на экран чата (один «пакет» на вход). */
export function stashDiaryDraftContextForChat(text: string) {
  pendingContext = text.trim().length > 0 ? text.trim() : null;
}

/** Забрать контекст при фокусе чата (очищает буфер). */
export function consumeDiaryDraftContextForChat(): string | null {
  const v = pendingContext;
  pendingContext = null;
  return v;
}

const MAX_CONTEXT_CHARS = 4000;

/** Есть ли в черновике что-то кроме шага мастера (поля, теги, названия эмоций). Процент без названия эмоции не считается. */
export function diaryDraftHasSubstantiveChatContext(params: {
  form: DiaryDraftFormState;
  items: DiaryEmotionRow[];
  selectedTags: Set<string>;
}): boolean {
  const { form, items, selectedTags } = params;
  if (form.situation.trim()) return true;
  if (form.thought.trim()) return true;
  if (form.body.trim()) return true;
  if (form.behavior.trim()) return true;
  if (form.behaviorAlt.trim()) return true;
  if (selectedTags.size > 0) return true;
  return items.some((row) => row.text.trim().length > 0);
}

/** Собрать человекочитаемое описание заполненных полей черновика для промпта к ИИ. */
export function buildDiaryDraftChatContext(params: {
  step: number;
  form: DiaryDraftFormState;
  items: DiaryEmotionRow[];
  selectedTags: Set<string>;
}): string {
  const { step, form, items, selectedTags } = params;
  const lines: string[] = [];
  lines.push(`Текущий шаг мастера записи: ${step}`);

  const situation = form.situation.trim();
  if (situation) lines.push(`Ситуация: ${situation}`);

  const thought = form.thought.trim();
  if (thought) lines.push(`Мысли: ${thought}`);

  const body = form.body.trim();
  if (body) lines.push(`Тело / ощущения: ${body}`);

  const behavior = form.behavior.trim();
  if (behavior) lines.push(`Поведение: ${behavior}`);

  const behaviorAlt = form.behaviorAlt.trim();
  if (behaviorAlt) lines.push(`Желаемое поведение в следующий раз: ${behaviorAlt}`);

  /** Без названия эмоции процент в контекст не включаем — иначе модель ошибочно трактует «голые» числа. */
  const emotionLines = items
    .map((row) => {
      const t = row.text.trim();
      const p = row.percent.trim();
      if (!t) return null;
      if (p) return `${t} (${p}%)`;
      return t;
    })
    .filter((x): x is string => Boolean(x));

  if (emotionLines.length > 0) {
    lines.push(`Эмоции (как указано в форме): ${emotionLines.join(", ")}`);
  }

  if (selectedTags.size > 0) {
    lines.push(`Выбранные теги: ${[...selectedTags].join(", ")}`);
  }

  let text = lines.join("\n");
  if (text.length > MAX_CONTEXT_CHARS) {
    text = `${text.slice(0, MAX_CONTEXT_CHARS)}\n… (текст обрезан)`;
  }
  return text;
}
