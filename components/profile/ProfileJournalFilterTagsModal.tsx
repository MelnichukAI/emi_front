import { colors } from "@/constants/colors";
import { DIARY_ENTRY_TAG_GROUPS } from "@/constants/diaryEntryTags";
import { useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type Props = {
  visible: boolean;
  /** Увеличивается при каждом открытии — подставляет `initialTags` во внутреннее состояние */
  resetKey: number;
  initialTags: readonly string[];
  onRequestClose: () => void;
  onSave: (tags: Set<string>) => void;
};

export default function ProfileJournalFilterTagsModal({
  visible,
  resetKey,
  initialTags,
  onRequestClose,
  onSave,
}: Props) {
  const insets = useSafeAreaInsets();
  const { height: windowH } = useWindowDimensions();
  const sheetMaxH = Math.min(windowH * 0.92, windowH - insets.top - 8);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!visible) return;
    setSelectedTags(new Set(initialTags));
  }, [visible, resetKey, initialTags]);

  const selectedCount = useMemo(() => selectedTags.size, [selectedTags]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const handleSave = () => {
    onSave(new Set(selectedTags));
    onRequestClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onRequestClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable
          style={styles.backdrop}
          onPress={onRequestClose}
          accessibilityLabel="Закрыть"
        />
        <View
          style={[
            styles.sheet,
            {
              height: sheetMaxH,
              paddingTop: 12 + insets.top,
              paddingBottom: 12 + insets.bottom,
            },
          ]}
        >
          <View style={styles.header}>
            <Pressable onPress={onRequestClose} hitSlop={12}>
              <Text style={styles.headerCancel}>Отмена</Text>
            </Pressable>
            <Text style={styles.headerTitle}>Теги для фильтра</Text>
            <View style={styles.headerSpacer} />
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.lead}>
              Выберите теги: запись попадёт в список, если в ней есть все выбранные
              теги. Выбрано: {selectedCount}
            </Text>

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
                      >
                        <Text
                          style={[styles.tagText, isActive && styles.tagTextActive]}
                        >
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.saveBtn, pressed && styles.pressed]}
              onPress={handleSave}
            >
              <Text style={styles.saveBtnText}>Сохранить</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 69, 0.4)",
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: "rgba(75, 69, 150, 0.12)",
    flexDirection: "column",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(75, 69, 150, 0.12)",
  },
  headerCancel: {
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
    width: 72,
  },
  scroll: {
    flex: 1,
    minHeight: 0,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
  },
  lead: {
    fontSize: 14,
    color: colors.subtext,
    marginBottom: 14,
    lineHeight: 20,
  },
  categoryBlock: {
    marginBottom: 18,
    backgroundColor: colors.card,
    borderRadius: 14,
    padding: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
    color: colors.text,
  },
  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    borderRadius: 16,
    backgroundColor: "#ECE8DE",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tagActive: {
    backgroundColor: colors.primary,
  },
  tagText: {
    color: colors.text,
    fontSize: 14,
  },
  tagTextActive: {
    color: "#fff",
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#C8D1E3",
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
  saveBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  pressed: {
    opacity: 0.85,
  },
});
