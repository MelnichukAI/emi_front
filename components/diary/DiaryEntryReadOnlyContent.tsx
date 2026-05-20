import {
  extractEntryTags,
  normalizeEntryText,
  parseEmotionRows,
  toEmotionDisplayLines,
  type DiaryEntryDetail,
} from "@/lib/diary-entry-detail";
import { useMemo } from "react";
import { Text, View } from "react-native";
import { diaryEntryDetailStyles as styles } from "./diaryEntryDetailStyles";

function Section({ title, body }: { title: string; body: string }) {
  const isEmpty = body.trim().length === 0;
  return (
    <View style={[styles.section, isEmpty && styles.sectionEmpty]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{isEmpty ? "-" : body}</Text>
    </View>
  );
}

type Props = {
  entry: DiaryEntryDetail | null;
  loading: boolean;
};

export default function DiaryEntryReadOnlyContent({ entry, loading }: Props) {
  const draft = useMemo(
    () => ({
      situation: normalizeEntryText(entry?.situation),
      thought: normalizeEntryText(entry?.thought),
      reaction: normalizeEntryText(entry?.reaction),
      behavior: normalizeEntryText(entry?.behavior),
      behaviorAlt: normalizeEntryText(entry?.behaviorAlt),
    }),
    [entry],
  );

  const emotions = useMemo(
    () => toEmotionDisplayLines(parseEmotionRows(entry?.emotion)),
    [entry?.emotion],
  );
  const tags = useMemo(() => extractEntryTags(entry?.tags), [entry?.tags]);

  const hasSituation = draft.situation.length > 0;
  const hasThought = draft.thought.length > 0;
  const hasReaction = draft.reaction.length > 0;
  const hasEmotion = emotions.length > 0;
  const hasBehavior = draft.behavior.length > 0;
  const hasBehaviorAlt = draft.behaviorAlt.length > 0;
  const hasTags = tags.length > 0;

  if (loading) {
    return <Section title="Статус" body="Загрузка..." />;
  }

  if (!entry) {
    return <Section title="Статус" body="Запись не найдена" />;
  }

  return (
    <>
      {hasSituation ? <Section title="Ситуация" body={draft.situation} /> : null}
      {hasThought ? <Section title="Мысль" body={draft.thought} /> : null}
      {hasReaction ? (
        <Section title="Тело и ощущения" body={draft.reaction} />
      ) : null}

      {hasEmotion ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Эмоции</Text>
          {emotions.map((emotionLine) => (
            <Text key={emotionLine} style={styles.emotionLine}>
              {emotionLine}
            </Text>
          ))}
        </View>
      ) : null}

      {hasBehavior ? <Section title="Поведение" body={draft.behavior} /> : null}
      {hasBehaviorAlt ? (
        <Section title="Альтернативное поведение" body={draft.behaviorAlt} />
      ) : null}

      {hasTags ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Теги</Text>
          <View style={styles.tagWrap}>
            {tags.map((tag) => (
              <View key={tag} style={styles.tagChip}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </>
  );
}
