import PrimaryButton from "@/components/common/primaryButton";
import { colors } from "@/constants/colors";
import { isKnownEmotionName } from "@/data/emotions";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { useDiaryDraft } from "@/lib/diary-draft-context";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import type { HomeTabStackParamList } from "@/lib/home-tab-stack-types";
import { Ionicons } from "@expo/vector-icons";
import type { NavigationProp } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DiaryCreateResponse = {
  id: string;
};

type ReflectionEmotion = {
  name: string;
  percent: number;
};

function Section({ title, body }: { title: string; body: string }) {
  if (!body.trim()) return null;
  return (
    <View style={styles.section}>
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Назад"
          style={({ pressed }) => [
            styles.backChip,
            pressed && styles.backChipPressed,
          ]}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={colors.surface}
          />
          <Text style={styles.backChipLabel}>Назад</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Убедитесь, что всё отражает ваш опыт. После сохранения запись попадет
          в дневник.
        </Text>

        <Section title="Ситуация" body={form.situation} />
        <Section title="Мысль" body={form.thought} />
        <Section title="Тело и ощущения" body={form.body} />

        {emotions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Эмоции</Text>
            {emotions.map((e) => (
              <Text key={`${e.name}-${e.percent}`} style={styles.emotionLine}>
                {e.name}
                {Number.isFinite(e.percent) ? ` - ${e.percent}%` : ""}
              </Text>
            ))}
          </View>
        ) : null}

        <Section title="Поведение" body={form.behavior} />
        <Section title="Альтернативное поведение" body={form.behaviorAlt} />

        {tags.length > 0 ? (
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
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: footerBottomPad }]}>
        <View style={styles.visibilityRow}>
          <Text style={styles.visibilityLabel}>Показывать терапевту</Text>
          <Switch
            value={sendToTherapist}
            disabled={submitting}
            onValueChange={setSendToTherapist}
            trackColor={{ false: "#BCC5D8", true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </View>

        <PrimaryButton
          title={submitting ? "Сохранение..." : "Сохранить запись"}
          onPress={() => {
            if (!submitting) void handleSave();
          }}
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
  },
  /** Как заголовки шагов в `StepContent` (создание записи). */
  screenTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    letterSpacing: -0.3,
    marginBottom: 10,
  },
  backChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingLeft: 6,
    paddingRight: 14,
    gap: 2,
  },
  backChipPressed: {
    opacity: 0.88,
  },
  backChipLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.surface,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  lead: {
    fontSize: 15,
    color: colors.subtext,
    marginBottom: 20,
    lineHeight: 22,
  },
  section: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
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
    backgroundColor: colors.secondary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
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
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 12,
    backgroundColor: colors.card,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  visibilityLabel: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});
