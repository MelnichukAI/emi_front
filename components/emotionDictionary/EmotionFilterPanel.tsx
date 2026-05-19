import EmotionAutocompleteInput from "@/components/common/emotionAutocompleteInput";
import { colors } from "@/constants/colors";
import { isKnownEmotionName } from "@/data/emotions";
import {
  EMOTION_DICTIONARY_BASE_EMOTIONS,
  EMOTION_DICTIONARY_CATEGORIES,
  EMOTION_DICTIONARY_ENERGY_VALUES,
  EMOTION_DICTIONARY_POLARITIES,
  EMOTION_DICTIONARY_SIZES,
  EMOTION_DICTIONARY_VALENCE_VALUES,
  EMPTY_EMOTION_DICTIONARY_FILTER,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
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

/** Горизонтальный отступ контента от левого и правого края панели (px). */
const FILTER_PANEL_EDGE_PAD = 12;
/** Доля ширины ряда на одну цифру: чуть уже полной трети, выравнивание слева. */
const CHIP_NUM_WIDTH_PCT = 100 / 3 / 1.5;

type NumericChipGridProps = {
  values: readonly number[];
  selected: number | null;
  onToggle: (value: number) => void;
};

/** Два ряда по 3: 0–2 сверху, 3–5 снизу. */
function NumericChipGrid({ values, selected, onToggle }: NumericChipGridProps) {
  const rows = [values.slice(0, 3), values.slice(3, 6)] as const;

  return (
    <View style={styles.chipGrid2x3}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.chipRow3}>
          {row.map((n) => {
            const isSelected = selected === n;
            return (
              <Pressable
                key={n}
                onPress={() => onToggle(n)}
                style={({ pressed }) => [
                  styles.chip,
                  styles.chipNumFlex,
                  isSelected && styles.chipSelected,
                  pressed && styles.chipPressed,
                ]}
              >
                <Text
                  style={[styles.chipText, isSelected && styles.chipTextSelected]}
                >
                  {n}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

type Props = {
  visible: boolean;
  draft: EmotionDictionaryFilter;
  onChangeDraft: (next: EmotionDictionaryFilter) => void;
  onApply: (finalFilter: EmotionDictionaryFilter) => void;
  onCancel: () => void;
  /** Сброс применённого фильтра на экране без закрытия панели (кнопка «Сбросить»). */
  onResetFilters?: () => void;
};

export default function EmotionFilterPanel({
  visible,
  draft,
  onChangeDraft,
  onApply,
  onCancel,
  onResetFilters,
}: Props) {
  const insets = useSafeAreaInsets();
  const [similarQuery, setSimilarQuery] = useState("");

  useEffect(() => {
    if (visible) {
      setSimilarQuery(draft.similarName ?? "");
    }
  }, [visible, draft.similarName]);

  const screenH = Dimensions.get("window").height;
  const screenW = Dimensions.get("window").width;
  const panelTop = insets.top + 8;
  const panelBottomInset = Math.max(insets.bottom, 8);
  /** Почти на всю высоту экрана с учётом safe area. */
  const panelH = screenH - panelTop - panelBottomInset - 8;

  /** Ширина ряда «Сбросить» + «Применить» (без растягивания по всей панели). */
  const [footerButtonsWidth, setFooterButtonsWidth] = useState(0);

  const panelW = useMemo(() => {
    const maxW = screenW - 16;
    if (footerButtonsWidth <= 0) {
      return Math.min(maxW, 260);
    }
    return Math.min(maxW, footerButtonsWidth + FILTER_PANEL_EDGE_PAD * 2);
  }, [screenW, footerButtonsWidth]);

  const toggleExclusive = (
    key: keyof EmotionDictionaryFilter,
    value: EmotionDictionaryFilter[keyof EmotionDictionaryFilter],
  ) => {
    const current = draft[key];
    const nextVal = current === value ? null : value;
    onChangeDraft({ ...draft, [key]: nextVal } as EmotionDictionaryFilter);
  };

  const handleResetDraft = () => {
    onChangeDraft({ ...EMPTY_EMOTION_DICTIONARY_FILTER });
    setSimilarQuery("");
    onResetFilters?.();
  };

  const handleSimilarBlur = (value: string) => {
    const t = value.trim();
    if (t.length === 0) return;
    if (!isKnownEmotionName(t)) {
      alert("Выберите эмоцию из списка.");
      setSimilarQuery("");
    }
  };

  const handleApply = () => {
    const t = similarQuery.trim();
    if (t.length > 0 && !isKnownEmotionName(t)) {
      alert("Выберите эмоцию из списка.");
      return;
    }
    const similarName = t && isKnownEmotionName(t) ? t : null;
    onApply({ ...draft, similarName });
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
          accessibilityLabel="Закрыть фильтр без применения"
        />
        <View
          style={[
            styles.panel,
            {
              width: panelW,
              height: Math.max(panelH, 280),
              top: panelTop,
              paddingBottom: panelBottomInset,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Pressable
              onPress={onCancel}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel="Закрыть"
            >
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
            <Text style={[styles.fieldLabel, styles.fieldLabelFirst]}>
              Базовая эмоция
            </Text>
            <View style={styles.chipWrap}>
              {EMOTION_DICTIONARY_BASE_EMOTIONS.map((name) => {
                const selected = draft.baseEmotion === name;
                return (
                  <Pressable
                    key={name}
                    onPress={() => toggleExclusive("baseEmotion", name)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                      numberOfLines={1}
                    >
                      {name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Энергия</Text>
            <NumericChipGrid
              values={EMOTION_DICTIONARY_ENERGY_VALUES}
              selected={draft.energy}
              onToggle={(n) => toggleExclusive("energy", n)}
            />

            <Text style={styles.fieldLabel}>Валентность</Text>
            <NumericChipGrid
              values={EMOTION_DICTIONARY_VALENCE_VALUES}
              selected={draft.valence}
              onToggle={(n) => toggleExclusive("valence", n)}
            />

            <Text style={styles.fieldLabel}>Оценка</Text>
            <View style={styles.chipWrap}>
              {EMOTION_DICTIONARY_POLARITIES.map((p) => {
                const selected = draft.polarity === p;
                return (
                  <Pressable
                    key={p}
                    onPress={() => toggleExclusive("polarity", p)}
                    style={({ pressed }) => [
                      styles.chip,
                      styles.chipWide,
                      selected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.fieldLabel}>Тип</Text>
            <View style={styles.chipWrap}>
              {EMOTION_DICTIONARY_CATEGORIES.map((cat) => {
                const selected = draft.category === cat;
                return (
                  <Pressable
                    key={cat}
                    onPress={() => toggleExclusive("category", cat)}
                    style={({ pressed }) => [
                      styles.chip,
                      selected && styles.chipSelected,
                      pressed && styles.chipPressed,
                    ]}
                  >
                    <Text
                      style={[styles.chipText, selected && styles.chipTextSelected]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

<Text style={styles.fieldLabel}>
  Размер словаря
</Text>

<View style={styles.chipWrap}>
  {EMOTION_DICTIONARY_SIZES.map(
    (size) => {
      const selected =
        draft.dictionarySize ===
        size;

      return (
        <Pressable
          key={size}
          onPress={() =>
            toggleExclusive(
              "dictionarySize",
              size,
            )
          }
          style={({ pressed }) => [
            styles.chip,
            selected &&
              styles.chipSelected,
            pressed &&
              styles.chipPressed,
          ]}
        >
          <Text
            style={[
              styles.chipText,
              selected &&
                styles.chipTextSelected,
            ]}
          >
            {size}
          </Text>
        </Pressable>
      );
    },
  )}
</View>

            <Text style={styles.fieldLabel}>Похожая эмоция</Text>
            <View style={styles.similarFieldWrap}>
              <EmotionAutocompleteInput
                value={similarQuery}
                onChangeText={setSimilarQuery}
                onInputBlur={handleSimilarBlur}
                placeholder="Начните вводить"
                maxSuggestions={8}
                suggestionsPlacement="above"
                inputStyle={styles.autocompleteInput}
              />
            </View>
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
                onPress={handleResetDraft}
                style={({ pressed }) => [styles.footerBtnGhost, pressed && styles.pressed]}
              >
                <Text style={styles.footerBtnGhostText}>Сбросить</Text>
              </Pressable>
              <Pressable
                onPress={handleApply}
                style={({ pressed }) => [styles.footerBtnPrimary, pressed && styles.pressed]}
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
    paddingHorizontal: FILTER_PANEL_EDGE_PAD,
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
    justifyContent: "flex-end",
    marginBottom: 8,
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
    color: colors.text,
    marginTop: 12,
    marginBottom: 8,
  },
  fieldLabelFirst: {
    marginTop: 0,
  },
  similarFieldWrap: {
    zIndex: 2,
    elevation: 4,
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chipGrid2x3: {
    gap: 8,
  },
  chipRow3: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-start",
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.text,
    backgroundColor: colors.surface,
    maxWidth: "100%",
  },
  chipNumFlex: {
    flexGrow: 0,
    flexShrink: 0,
    width: `${CHIP_NUM_WIDTH_PCT}%`,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 9,
  },
  chipWide: {
    flexGrow: 1,
    minWidth: "45%",
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
    color: colors.primary,
  },
  chipTextSelected: {
    color: colors.surface,
    fontWeight: "600",
  },
  autocompleteInput: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    borderWidth: 1,
    borderColor: colors.text,
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
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: "transparent",
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
    borderWidth: 1,
    borderColor: colors.primary,
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
