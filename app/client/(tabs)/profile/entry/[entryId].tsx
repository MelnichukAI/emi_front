import { colors } from "@/constants/colors";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DiaryEntryResponse = {
  id: string;
  situation?: string | null;
  thought?: string | null;
  reaction?: string | null;
  behavior?: string | null;
  behaviorAlt?: string | null;
  emotion?: string | null;
  tags?: string | null;
  createdAt?: string | null;
};

type EmotionRow = {
  text: string;
  percent: string;
};

function extractEmotionLines(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function parseEmotionRows(raw?: string | null): EmotionRow[] {
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

function toEmotionDisplayLines(items: EmotionRow[]): string[] {
  return items
    .map((item) => {
      const name = item.text.trim();
      const percent = item.percent.trim();
      if (!name) return "";
      return percent ? `${name} - ${percent}%` : name;
    })
    .filter((line) => line.length > 0);
}

function extractTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

function normalizeText(value?: string | null): string {
  const normalized = value?.trim() ?? "";
  return normalized;
}

function Section({
  title,
  body,
  isEditing,
  onChangeBody,
}: {
  title: string;
  body: string;
  isEditing: boolean;
  onChangeBody?: (value: string) => void;
}) {
  const isEmpty = body.trim().length === 0;
  return (
    <View style={[styles.section, isEmpty && styles.sectionEmpty]}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {isEditing ? (
        <TextInput
          style={styles.sectionInput}
          multiline
          value={body}
          onChangeText={onChangeBody}
          placeholder="-"
          placeholderTextColor={colors.subtext}
        />
      ) : (
        <Text style={styles.sectionBody}>{isEmpty ? "-" : body}</Text>
      )}
    </View>
  );
}

export default function ProfileEntryDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const [entry, setEntry] = useState<DiaryEntryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState({
    situation: "",
    thought: "",
    reaction: "",
    behavior: "",
    behaviorAlt: "",
  });
  const [emotionItems, setEmotionItems] = useState<EmotionRow[]>([
    { text: "", percent: "100" },
  ]);

  const loadEntry = useCallback(async () => {
    const id = entryId?.trim();
    if (!id) {
      setEntry(null);
      setLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setEntry(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const diary = await apiRequest<DiaryEntryResponse[]>("/diary?all=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = (Array.isArray(diary) ? diary : []).find((item) => item.id === id);
      setEntry(found ?? null);
      setDraft({
        situation: normalizeText(found?.situation),
        thought: normalizeText(found?.thought),
        reaction: normalizeText(found?.reaction),
        behavior: normalizeText(found?.behavior),
        behaviorAlt: normalizeText(found?.behaviorAlt),
      });
      setEmotionItems(parseEmotionRows(found?.emotion));
    } catch {
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useFocusEffect(
    useCallback(() => {
      void loadEntry();
    }, [loadEntry])
  );

  const handleDeleteEntry = useCallback(async () => {
    const id = entryId?.trim();
    if (!id || deleting) return;

    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }

    try {
      setDeleting(true);
      await apiRequest(`/diary/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      router.replace("/client/profile");
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось удалить запись"
      );
    } finally {
      setDeleting(false);
    }
  }, [deleting, entryId, router]);

  const confirmDelete = useCallback(() => {
    if (loading || !entry || deleting || saving) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Удалить запись без возможности восстановления?");
      if (confirmed) {
        void handleDeleteEntry();
      }
      return;
    }

    Alert.alert("Удалить запись", "Удалить запись без возможности восстановления?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: () => {
          void handleDeleteEntry();
        },
      },
    ]);
  }, [deleting, entry, handleDeleteEntry, loading, saving]);

  const emotions = useMemo(() => toEmotionDisplayLines(emotionItems), [emotionItems]);
  const tags = useMemo(() => extractTags(entry?.tags), [entry?.tags]);
  const hasSituation = draft.situation.trim().length > 0;
  const hasThought = draft.thought.trim().length > 0;
  const hasReaction = draft.reaction.trim().length > 0;
  const hasEmotion = emotions.length > 0;
  const addEmotionItem = () => {
    const hasIncomplete = emotionItems.some(
      (item) => item.text.trim().length === 0 || item.percent.trim().length === 0
    );
    if (hasIncomplete) {
      Alert.alert("Заполните поля", "Сначала заполните текущие эмоции и проценты.");
      return;
    }
    setEmotionItems((prev) => [...prev, { text: "", percent: "100" }]);
  };

  const updateEmotionItem = (
    index: number,
    field: keyof EmotionRow,
    value: string
  ) => {
    setEmotionItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const removeEmotionItem = (index: number) => {
    if (emotionItems.length <= 1) return;
    setEmotionItems((prev) => prev.filter((_, i) => i !== index));
  };

  const hasBehavior = draft.behavior.trim().length > 0;
  const hasBehaviorAlt = draft.behaviorAlt.trim().length > 0;
  const hasTags = tags.length > 0;

  const handleSaveEdits = useCallback(async () => {
    const id = entryId?.trim();
    if (!id || saving) return;

    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }

    const hasIncompleteEmotion = emotionItems.some(
      (item) => item.text.trim().length === 0 || item.percent.trim().length === 0
    );
    if (hasIncompleteEmotion) {
      Alert.alert("Заполните поля", "Укажите эмоцию и процент в каждой строке.");
      return;
    }

    const emotionPayload = emotionItems
      .map((item) => ({
        name: item.text.trim(),
        percent: Number(item.percent),
      }))
      .filter((item) => item.name.length > 0 && Number.isFinite(item.percent));

    try {
      setSaving(true);
      await apiRequest(`/diary/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          situation: draft.situation.trim(),
          thought: draft.thought.trim(),
          reaction: draft.reaction.trim(),
          behavior: draft.behavior.trim(),
          behaviorAlt: draft.behaviorAlt.trim(),
          emotion: emotionPayload,
        }),
      });
      await loadEntry();
      setIsEditing(false);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить изменения"
      );
    } finally {
      setSaving(false);
    }
  }, [draft, emotionItems, entryId, loadEntry, saving]);

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.headerBack}>Назад</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Запись дневника</Text>
        <View style={styles.headerRight}>
          <Pressable
            onPress={confirmDelete}
            disabled={loading || !entry || deleting || saving}
            style={({ pressed }) => [
              styles.deleteBtn,
              (loading || !entry || deleting || saving) && styles.deleteBtnDisabled,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
          >
            <Ionicons name="trash-outline" size={14} color="#fff" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: (isEditing ? 112 : 96) + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.lead}>
          {isEditing
            ? "Режим редактирования: можно изменить все поля записи."
            : "Показываются только заполненные поля записи."}
        </Text>

        {loading ? (
          <Section title="Статус" body="Загрузка..." isEditing={false} />
        ) : !entry ? (
          <Section title="Статус" body="Запись не найдена" isEditing={false} />
        ) : (
          <>
            {(isEditing || hasSituation) && (
              <Section
                title="Ситуация"
                body={draft.situation}
                isEditing={isEditing}
                onChangeBody={(value) => setDraft((prev) => ({ ...prev, situation: value }))}
              />
            )}
            {(isEditing || hasThought) && (
              <Section
                title="Мысль"
                body={draft.thought}
                isEditing={isEditing}
                onChangeBody={(value) => setDraft((prev) => ({ ...prev, thought: value }))}
              />
            )}
            {(isEditing || hasReaction) && (
              <Section
                title="Тело и ощущения"
                body={draft.reaction}
                isEditing={isEditing}
                onChangeBody={(value) => setDraft((prev) => ({ ...prev, reaction: value }))}
              />
            )}

            {(isEditing || hasEmotion) && (
              <View style={[styles.section, !hasEmotion && styles.sectionEmpty]}>
                <Text style={styles.sectionTitle}>Эмоции</Text>
                {isEditing ? (
                  <>
                    {emotionItems.map((item, index) => (
                      <View key={index} style={styles.emotionRow}>
                        <TextInput
                          style={styles.emotionTextInput}
                          value={item.text}
                          onChangeText={(value) =>
                            updateEmotionItem(index, "text", value)
                          }
                          placeholder="эмоция"
                          placeholderTextColor={colors.subtext}
                        />
                        <TextInput
                          style={styles.emotionPercentInput}
                          value={item.percent}
                          onChangeText={(value) =>
                            updateEmotionItem(index, "percent", value)
                          }
                          keyboardType="numeric"
                          placeholder="%"
                          placeholderTextColor={colors.subtext}
                        />
                        {emotionItems.length > 1 ? (
                          <Pressable onPress={() => removeEmotionItem(index)}>
                            <Text style={styles.emotionDeleteBtn}>✕</Text>
                          </Pressable>
                        ) : null}
                      </View>
                    ))}
                    <Pressable onPress={addEmotionItem} style={styles.addEmotionBtn}>
                      <Text style={styles.addEmotionText}>+ Добавить</Text>
                    </Pressable>
                  </>
                ) : (
                  emotions.map((emotionLine) => (
                    <Text key={emotionLine} style={styles.emotionLine}>
                      {emotionLine}
                    </Text>
                  ))
                )}
              </View>
            )}

            {(isEditing || hasBehavior) && (
              <Section
                title="Поведение"
                body={draft.behavior}
                isEditing={isEditing}
                onChangeBody={(value) => setDraft((prev) => ({ ...prev, behavior: value }))}
              />
            )}
            {(isEditing || hasBehaviorAlt) && (
              <Section
                title="Альтернативное поведение"
                body={draft.behaviorAlt}
                isEditing={isEditing}
                onChangeBody={(value) => setDraft((prev) => ({ ...prev, behaviorAlt: value }))}
              />
            )}

            {(isEditing || hasTags) && (
              <View style={[styles.section, !hasTags && styles.sectionEmpty]}>
                <Text style={styles.sectionTitle}>Теги</Text>
                {tags.length > 0 ? (
                  <View style={styles.tagWrap}>
                    {tags.map((tag) => (
                      <View key={tag} style={styles.tagChip}>
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.sectionBody}>-</Text>
                )}

                {isEditing ? (
                  <Pressable
                    style={styles.addTagBtn}
                    onPress={() =>
                      router.push({
                        pathname: "/client/profile/entry/[entryId]/tags",
                        params: { entryId: String(entry.id) },
                      })
                    }
                  >
                    <Text style={styles.addTagText}>Изменить теги</Text>
                  </Pressable>
                ) : null}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {!loading && entry ? (
        <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
          <Pressable
            style={({ pressed }) => [
              styles.editBtn,
              isEditing && styles.editBtnActive,
              saving && styles.editBtnDisabled,
              pressed && styles.pressed,
            ]}
            onPress={() => {
              if (isEditing) {
                void handleSaveEdits();
              } else {
                setIsEditing(true);
              }
            }}
            disabled={saving}
          >
            <Text style={[styles.editBtnText, isEditing && styles.editBtnTextActive]}>
              {isEditing ? (saving ? "Сохранение..." : "Сохранить") : "Изменить"}
            </Text>
          </Pressable>
        </View>
      ) : null}
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
  headerRight: {
    width: 56,
    alignItems: "flex-end",
  },
  deleteBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E35D5D",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtnDisabled: {
    opacity: 0.45,
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
  sectionEmpty: {
    backgroundColor: "#EAE4D8",
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
  sectionInput: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
    borderWidth: 1,
    borderColor: "#D6DCE8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    textAlignVertical: "top",
    minHeight: 44,
  },
  emotionLine: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 6,
  },
  emotionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  emotionTextInput: {
    flex: 1,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D6DCE8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    color: colors.text,
  },
  emotionPercentInput: {
    width: 64,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#D6DCE8",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#FFFFFF",
    color: colors.text,
    textAlign: "center",
  },
  emotionDeleteBtn: {
    fontSize: 18,
    color: "#E35D5D",
    paddingHorizontal: 6,
  },
  addEmotionBtn: {
    marginTop: 2,
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.card,
  },
  addEmotionText: {
    color: colors.primary,
    fontWeight: "600",
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
  addTagBtn: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addTagText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C8D1E3",
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  editBtn: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  editBtnActive: {
    backgroundColor: "#5B6E94",
  },
  editBtnDisabled: {
    opacity: 0.6,
  },
  editBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  editBtnTextActive: {
    color: "#fff",
  },
  pressed: {
    opacity: 0.85,
  },
});
