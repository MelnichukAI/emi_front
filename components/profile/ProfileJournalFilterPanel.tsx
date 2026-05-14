import EmotionAutocompleteInput from "@/components/common/emotionAutocompleteInput";
import ProfileRuDatePickerField from "@/components/profile/ProfileRuDatePickerField";
import { colors } from "@/constants/colors";
import { isKnownEmotionName } from "@/data/emotions";
import {
  PROFILE_JOURNAL_ENERGY_VALUES,
  PROFILE_JOURNAL_VALENCE_VALUES,
  type ProfileJournalFilter,
} from "@/lib/profile-journal-filter";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const PANEL_PAD = 12;
const PANEL_MAX_W = 300;

type Props = {
  visible: boolean;
  draft: ProfileJournalFilter;
  onChangeDraft: (next: ProfileJournalFilter) => void;
  onApply: (final: ProfileJournalFilter) => void;
  /** Сбросить фильтр, сразу показать все записи, панель остаётся открытой */
  onResetApply: () => void;
  onCancel: () => void;
  onOpenTagPicker: () => void;
};

export default function ProfileJournalFilterPanel({
  visible,
  draft,
  onChangeDraft,
  onApply,
  onResetApply,
  onCancel,
  onOpenTagPicker,
}: Props) {
  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get("window").height;
  const screenW = Dimensions.get("window").width;
  const panelTop = insets.top + 8;
  const panelBottomInset = Math.max(insets.bottom, 8);
  const panelH = screenH - panelTop - panelBottomInset - 8;

  const [footerButtonsWidth, setFooterButtonsWidth] = useState(0);
  const panelWMeasured = useMemo(() => {
    const maxW = screenW - 16;
    if (footerButtonsWidth <= 0) return Math.min(maxW, PANEL_MAX_W);
    return Math.min(maxW, footerButtonsWidth + PANEL_PAD * 2);
  }, [screenW, footerButtonsWidth]);

  const toggleEnergy = (n: number) => {
    onChangeDraft({
      ...draft,
      energy: draft.energy === n ? null : n,
    });
  };

  const toggleValence = (n: number) => {
    onChangeDraft({
      ...draft,
      valence: draft.valence === n ? null : n,
    });
  };

  const removeTag = (tag: string) => {
    const next = new Set(draft.tags);
    next.delete(tag);
    onChangeDraft({ ...draft, tags: next });
  };

  const handleReset = () => {
    onResetApply();
  };

  const handleApply = () => {
    const em = draft.emotionName.trim();
    const emotionName = em && isKnownEmotionName(em) ? em : "";
    onApply({
      ...draft,
      emotionName,
      dateFrom: draft.dateFrom.trim(),
      dateTo: draft.dateTo.trim(),
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <View style={styles.modalRoot}>
        <Pressable
          style={styles.backdrop}
          onPress={onCancel}
          accessibilityLabel="Закрыть фильтр"
        />
        <View
          style={[
            styles.panel,
            {
              width: panelWMeasured,
              height: Math.max(panelH, 280),
              top: panelTop,
              paddingBottom: panelBottomInset,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>Фильтр записей</Text>
            <Pressable onPress={onCancel} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.panelScroll}
            contentContainerStyle={styles.panelScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={false}
          >
            <ProfileRuDatePickerField
              isFirst
              label="Дата с"
              value={draft.dateFrom}
              onChange={(t) => onChangeDraft({ ...draft, dateFrom: t })}
            />
            <ProfileRuDatePickerField
              label="Дата по"
              value={draft.dateTo}
              onChange={(t) => onChangeDraft({ ...draft, dateTo: t })}
            />

            <Text style={styles.fieldLabel}>Эмоция</Text>
            <Text style={styles.fieldHint}>
              Выберите из списка или оставьте пустым — любая эмоция.
            </Text>
            <EmotionAutocompleteInput
              value={draft.emotionName}
              onChangeText={(t) => onChangeDraft({ ...draft, emotionName: t })}
              placeholder="Начните вводить"
              maxSuggestions={12}
              suggestionsPlacement="above"
              inputStyle={styles.autocompleteInput}
            />

            <Text style={styles.fieldLabel}>Энергия (макс. по записям)</Text>
            <View style={styles.chipWrap}>
              {PROFILE_JOURNAL_ENERGY_VALUES.map((n) => {
                const selected = draft.energy === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => toggleEnergy(n)}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipNum,
                      selected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Валентность (макс. по записям)</Text>
            <View style={styles.chipWrap}>
              {PROFILE_JOURNAL_VALENCE_VALUES.map((n) => {
                const selected = draft.valence === n;
                return (
                  <Pressable
                    key={n}
                    onPress={() => toggleValence(n)}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipNum,
                      selected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                    >
                      {n}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Теги</Text>
            <Text style={styles.fieldHint}>
              Запись отфильтруется, если в ней есть все выбранные теги.
            </Text>
            <View style={styles.tagChipWrap}>
              {Array.from(draft.tags).map((tag) => (
                <Pressable
                  key={tag}
                  onPress={() => removeTag(tag)}
                  style={styles.tagChip}
                >
                  <Text style={styles.tagChipText}>{tag} ✕</Text>
                </Pressable>
              ))}
            </View>
            <Pressable style={styles.addTagsBtn} onPress={onOpenTagPicker}>
              <Text style={styles.addTagsBtnText}>Добавить теги</Text>
            </Pressable>
          </ScrollView>

          <View style={styles.panelFooter}>
            <View
              style={styles.footerBtnRow}
              onLayout={(e) => {
                const w = Math.ceil(e.nativeEvent.layout.width);
                if (w > 0 && w !== footerButtonsWidth) {
                  setFooterButtonsWidth(w);
                }
              }}
            >
              <Pressable
                onPress={handleReset}
                style={({ pressed }) => [
                  styles.footerBtnGhost,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerBtnGhostText}>Сбросить</Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={({ pressed }) => [
                  styles.footerBtnPrimary,
                  pressed && styles.pressed,
                ]}
              >
                <Text style={styles.footerBtnPrimaryText}>Применить</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 69, 0.35)",
  },
  panel: {
    position: "absolute",
    right: 0,
    backgroundColor: colors.card,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.18)",
    paddingHorizontal: PANEL_PAD,
    paddingTop: 12,
    zIndex: 2,
    shadowColor: "#2D2A45",
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 16,
  },
  panelHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  panelTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  panelScroll: {
    flex: 1,
  },
  panelScrollContent: {
    paddingBottom: 12,
    gap: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },
  fieldHint: {
    fontSize: 12,
    color: colors.subtext,
    lineHeight: 17,
    marginBottom: 6,
  },
  autocompleteInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.15)",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.25)",
    backgroundColor: colors.surface,
  },
  chipNum: {
    minWidth: 44,
    alignItems: "center",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipPressed: {
    opacity: 0.9,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.text,
    textAlign: "center",
  },
  chipTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
  tagChipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  tagChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },
  tagChipText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  addTagsBtn: {
    alignSelf: "flex-start",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    marginBottom: 8,
  },
  addTagsBtnText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "700",
  },
  panelFooter: {
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(75, 69, 150, 0.15)",
  },
  footerBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  footerBtnGhost: {
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  footerBtnGhostText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primary,
  },
  footerBtnPrimary: {
    flexShrink: 0,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: colors.primary,
  },
  footerBtnPrimaryText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.surface,
  },
  pressed: {
    opacity: 0.88,
  },
});
