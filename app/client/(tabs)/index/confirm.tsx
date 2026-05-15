import BackChipButton from "@/components/common/backChipButton";
import PrimaryButton from "@/components/common/primaryButton";
import TherapistVisibilitySwitch from "@/components/common/therapistVisibilitySwitch";
import { colors } from "@/constants/colors";
import { isKnownEmotionName } from "@/data/emotions";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { useDiaryDraft } from "@/lib/diary-draft-context";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DiaryCreateResponse = {
  id: string;
};

type ReflectionEmotion = {
  name: string;
  percent: number;
};

function Section({
  title,
  body,
  isFirst,
}: {
  title: string;
  body: string;
  isFirst?: boolean;
}) {
  if (!body.trim()) return null;
  return (
    <View style={[styles.section, isFirst && styles.sectionFirst]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body.trim()}</Text>
    </View>
  );
}

export default function ConfirmDiaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<HomeTabStackParamList>>();
  const { form, items, selectedTags, resetDraft } = useDiaryDraft();
  const [submitting, setSubmitting] = useState(false);
  const [sendToTherapist, setSendToTherapist] = useState(false);

  const emotions: ReflectionEmotion[] = items
    .map((item) => ({
      name: item.text.trim(),
      percent: Number(item.percent),
    }))
    .filter((item) => item.name.length > 0 && Number.isFinite(item.percent));

  const tags = Array.from(selectedTags);

  const firstVisibleBlock = useMemo(():
    | "situation"
    | "thought"
    | "body"
    | "emotions"
    | "behavior"
    | "behaviorAlt"
    | "tags"
    | null => {
    if (form.situation.trim()) return "situation";
    if (form.thought.trim()) return "thought";
    if (form.body.trim()) return "body";
    if (emotions.length > 0) return "emotions";
    if (form.behavior.trim()) return "behavior";
    if (form.behaviorAlt.trim()) return "behaviorAlt";
    if (tags.length > 0) return "tags";
    return null;
  }, [
    form.situation,
    form.thought,
    form.body,
    form.behavior,
    form.behaviorAlt,
    emotions.length,
    tags.length,
  ]);

  const handleSave = async () => {
    const token = getAccessToken();
    if (!token) {
      alert("Сессия не найдена. Войдите снова.");
      router.replace("/auth/login");
      return;
    }

    const hasSituation = form.situation.trim().length > 0;
    const hasThought = form.thought.trim().length > 0;
    const hasEmotion = emotions.length > 0;

    if (!hasSituation && !hasThought && !hasEmotion) {
      alert("Заполните хотя бы одно: ситуация, мысль или эмоция.");
      return;
    }

    const unknownEmotion = emotions.find(
      (emotion) => !isKnownEmotionName(emotion.name),
    );
    if (unknownEmotion) {
      alert("Выберите эмоции только из предложенного списка.");
      return;
    }
    const seen = new Set<string>();
    for (const emotion of emotions) {
      const normalized = emotion.name.trim().toLocaleLowerCase("ru");
      if (seen.has(normalized)) {
        alert("Нельзя выбрать одну и ту же эмоцию дважды.");
        return;
      }
      seen.add(normalized);
    }

    try {
      setSubmitting(true);
      const createdEntry = await apiRequest<DiaryCreateResponse>("/diary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          situation: form.situation.trim(),
          thought: form.thought.trim(),
          reaction: form.body.trim(),
          behavior: form.behavior.trim(),
          behaviorAlt: form.behaviorAlt.trim(),
          emotion: emotions,
          tags,
          visibility: sendToTherapist ? "THERAPIST" : "PRIVATE",
        }),
      });

      resetDraft();
      navigation.navigate("reflection", {
        diaryEntryId: createdEntry.id,
        emotionsJson: JSON.stringify(emotions),
      });
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Ошибка сохранения записи",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const footerBottomPad = Math.max(insets.bottom, 12);

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Text style={styles.screenTitle}>Проверьте запись</Text>
        <BackChipButton onPress={() => router.back()} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Section
          title="Ситуация"
          body={form.situation}
          isFirst={firstVisibleBlock === "situation"}
        />
        <Section
          title="Мысль"
          body={form.thought}
          isFirst={firstVisibleBlock === "thought"}
        />
        <Section
          title="Тело и ощущения"
          body={form.body}
          isFirst={firstVisibleBlock === "body"}
        />

        {emotions.length > 0 ? (
          <View
            style={[
              styles.section,
              firstVisibleBlock === "emotions" && styles.sectionFirst,
            ]}
          >
            <Text style={styles.sectionTitle}>Эмоции</Text>
            {emotions.map((e) => (
              <Text key={`${e.name}-${e.percent}`} style={styles.emotionLine}>
                {e.name}
                {Number.isFinite(e.percent) ? ` - ${e.percent}%` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        <Section
          title="Поведение"
          body={form.behavior}
          isFirst={firstVisibleBlock === "behavior"}
        />
        <Section
          title="Альтернативное поведение"
          body={form.behaviorAlt}
          isFirst={firstVisibleBlock === "behaviorAlt"}
        />

        {tags.length > 0 ? (
          <View
            style={[
              styles.section,
              firstVisibleBlock === "tags" && styles.sectionFirst,
            ]}
          >
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
        <View style={styles.visibilityRow}>
          <View style={styles.visibilityLabelWrap}>
            <Text style={styles.visibilityLabel}>Показать терапевту</Text>
          </View>
          <View style={styles.visibilitySwitchWrap}>
            <TherapistVisibilitySwitch
              value={sendToTherapist}
              disabled={submitting}
              onValueChange={setSendToTherapist}
            />
          </View>
        </View>

        <PrimaryButton
          title={submitting ? "Сохранение..." : "Сохранить запись"}
          onPress={() => {
            if (!submitting) void handleSave();
          }}
          disabled={submitting}
          flushHorizontal
          flushTop
          titleFontWeight="500"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.primary,
  },
  /** Как заголовки шагов в `StepContent` (создание записи). */
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionFirst: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  sectionBody: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  emotionLine: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "#FFFFFF",
    gap: 14,
  },
  /** Как строка под карточкой в `ProfileJournalSection`. */
  visibilityRow: {
    flexDirection: "row",
    alignItems: "stretch",
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  visibilityLabelWrap: {
    flex: 1,
    justifyContent: "center",
  },
  visibilitySwitchWrap: {
    justifyContent: "center",
  },
  visibilityLabel: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    marginTop: -5,
    ...Platform.select({
      android: { includeFontPadding: false, textAlignVertical: "center" },
      default: {},
    }),
  },
});
