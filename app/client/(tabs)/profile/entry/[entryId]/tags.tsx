import { colors } from "@/constants/colors";
import BackChipButton from "@/components/common/backChipButton";
import { DIARY_ENTRY_TAG_GROUPS } from "@/constants/diaryEntryTags";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type DiaryEntryResponse = {
  id: string;
  tags?: string | null;
};

function parseTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export default function EntryTagsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entryId } = useLocalSearchParams<{ entryId?: string }>();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadTags = useCallback(async () => {
    const id = entryId?.trim();
    if (!id) {
      setLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const diary = await apiRequest<DiaryEntryResponse[]>("/diary?all=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const found = (Array.isArray(diary) ? diary : []).find((item) => item.id === id);
      setSelectedTags(new Set(parseTags(found?.tags)));
    } catch {
      setSelectedTags(new Set());
    } finally {
      setLoading(false);
    }
  }, [entryId]);

  useFocusEffect(
    useCallback(() => {
      void loadTags();
    }, [loadTags])
  );

  const selectedCount = useMemo(() => selectedTags.size, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  };

  const handleSave = async () => {
    const id = entryId?.trim();
    if (!id || saving) return;

    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }

    try {
      setSaving(true);
      await apiRequest(`/diary/${id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tags: Array.from(selectedTags),
        }),
      });
      router.back();
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось обновить теги"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Text style={styles.headerTitle}>Теги записи</Text>
        <View style={styles.headerActions}>
          <BackChipButton onPress={() => router.back()} style={styles.backChip} />
        </View>
        <Text style={styles.lead}>
          {loading
            ? "Загрузка тегов..."
            : `Выбрано тегов: ${selectedCount}`}
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 96 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {DIARY_ENTRY_TAG_GROUPS.map((category) => (
          <View key={category.title} style={styles.categoryBlock}>
            <Text style={styles.categoryTitle}>{category.title}</Text>
            <View style={styles.tagsWrap}>
              {category.tags.map((tag) => {
                const isActive = selectedTags.has(tag);
                return (
                  <Pressable
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    style={[styles.tag, isActive && styles.tagActive]}
                    disabled={loading || saving}
                  >
                    <Text style={[styles.tagText, isActive && styles.tagTextActive]}>
                      {tag}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: 12 + insets.bottom }]}>
        <Pressable
          style={({ pressed }) => [
            styles.saveBtn,
            (loading || saving) && styles.saveBtnDisabled,
            pressed && styles.pressed,
          ]}
          onPress={() => void handleSave()}
          disabled={loading || saving}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Сохранение..." : "Сохранить теги"}
          </Text>
        </Pressable>
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
    gap: 12,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.text,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  /** Снимаем `alignSelf: "flex-start"` из `BackChipButton`, чтобы он не разъезжался в строке. */
  backChip: {
    alignSelf: "flex-start",
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  lead: {
    fontSize: 16,
    color: colors.textThird,
  },
  /** Под стиль шага 6 создания записи (`components/create/StepContent.tsx`). */
  categoryBlock: {
    marginBottom: 20,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.primary,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    overflow: "hidden",
  },
  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tagText: {
    color: colors.primary,
    fontSize: 16,
  },
  tagTextActive: {
    color: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 2,
    borderTopColor: colors.primary,
    paddingTop: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  saveBtn: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
  },
  saveBtnDisabled: {
    opacity: 0.55,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
