import PrimaryButton from "@/components/common/primaryButton";
import { colors } from "@/constants/colors";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useDiaryDraft } from "./_diary-draft-context";

type DiaryCreateResponse = {
  id: string;
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
  const { form, items, selectedTags, resetDraft } = useDiaryDraft();
  const [submitting, setSubmitting] = useState(false);

  const emotions = items
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

    if (!form.situation.trim() || !form.thought.trim()) {
      alert("Заполните минимум ситуацию и мысль.");
      return;
    }

    try {
      setSubmitting(true);
      await apiRequest<DiaryCreateResponse>("/diary", {
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
          visibility: "PRIVATE",
        }),
      });

      resetDraft();
      alert("Запись сохранена");
      router.replace("/client");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Ошибка сохранения записи",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.headerBack}>Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Проверьте запись</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          Убедитесь, что всё отражает ваш опыт. После сохранения запись попадёт
          в дневник.
        </Text>

        <Section title="Ситуация" body={form.situation} />
        <Section title="Мысль" body={form.thought} />
        <Section title="Тело и ощущения" body={form.body} />

        {emotions.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Эмоции</Text>
            {emotions.map((e) => (
              <Text key={e.name} style={styles.emotionLine}>
                {e.name}
                {Number.isFinite(e.percent) ? ` — ${e.percent}%` : ""}
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

      <View style={styles.footer}>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
  },
  headerBack: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
  },
  headerSpacer: {
    width: 56,
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
    paddingVertical: 16,
    paddingBottom: 28,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.subtext,
    backgroundColor: colors.background,
  },
});
