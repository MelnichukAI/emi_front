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

  const emotionLines = items
    .map((row) => {
      const t = row.text.trim();
      const p = row.percent.trim();
      if (!t && !p) return null;
      if (t && p) return `${t} (${p}%)`;
      return t || p;
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
