import EmotionAccordionList from "@/components/emotionDictionary/EmotionAccordionList";
import EmotionFilterPanel from "@/components/emotionDictionary/EmotionFilterPanel";
import { colors } from "@/constants/colors";
import { emotions, type Emotion } from "@/data/emotions";
import {
  applyEmotionDictionaryFilter,
  isEmotionDictionaryFilterActive,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";
import {
  useEmotionDictionaryUi,
  type EmotionDictionarySortMode,
} from "@/lib/emotion-dictionary-ui-context";
import { horizontalRule2px } from "@/lib/horizontal-rule-style";
import { REFERENCE_SECTION_GAP } from "@/lib/reference-layout-metrics";
import { Ionicons } from "@expo/vector-icons";
import { useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

type SortAnchor = { x: number; y: number; width: number; height: number };

/** Высота кнопки «Фильтр» (как у `toolBtn`: padding 12×2 + строка). */
const TOOLBAR_SINGLE_BTN_HEIGHT = 44;
const SCROLL_HORIZONTAL_PAD = 20;
/** Одинаковый вертикальный отступ между полосками, поиском и тулбаром. */
const SECTION_GAP = REFERENCE_SECTION_GAP;

type SortOption = {
  id: EmotionDictionarySortMode;
  label: string;
  /** Уголок вверх/вниз как в выпадающих списках (энергия, валентность). */
  direction?: "up" | "down";
};

const SORT_OPTIONS: SortOption[] = [
  { id: "alphabet_asc", label: "По алфавиту от А до Я" },
  { id: "alphabet_desc", label: "По алфавиту от Я до А" },
  { id: "energy_asc", label: "По энергии", direction: "up" },
  { id: "energy_desc", label: "По энергии", direction: "down" },
  { id: "valence_asc", label: "По валентности", direction: "up" },
  { id: "valence_desc", label: "По валентности", direction: "down" },
];

function SortOptionLabel({
  label,
  direction,
  textStyle,
  iconSize,
  iconColor,
  centered,
}: {
  label: string;
  direction?: "up" | "down";
  textStyle: object | object[];
  iconSize: number;
  iconColor: string;
  centered?: boolean;
}) {
  if (!direction) {
    return <Text style={textStyle}>{label}</Text>;
  }
  const iconName = direction === "up" ? "chevron-up" : "chevron-down";
  return (
    <View
      style={[
        styles.sortOptionLabelRow,
        centered && styles.sortOptionLabelRowCentered,
      ]}
    >
      <Text style={textStyle}>{label}</Text>
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </View>
  );
}

function compareNullableNumberAsc(
  a: number | null,
  b: number | null,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function sortEmotions(
  list: Emotion[],
  mode: EmotionDictionarySortMode,
): Emotion[] {
  const next = [...list];
  switch (mode) {
    case "alphabet_asc":
      next.sort((a, b) => a.name.localeCompare(b.name, "ru"));
      break;
    case "alphabet_desc":
      next.sort((a, b) => b.name.localeCompare(a.name, "ru"));
      break;
    case "energy_asc":
      next.sort((a, b) => compareNullableNumberAsc(a.energy, b.energy));
      break;
    case "energy_desc":
      next.sort((a, b) => -compareNullableNumberAsc(a.energy, b.energy));
      break;
    case "valence_asc":
      next.sort((a, b) => compareNullableNumberAsc(a.valence, b.valence));
      break;
    case "valence_desc":
      next.sort((a, b) => -compareNullableNumberAsc(a.valence, b.valence));
      break;
    default:
      break;
  }
  return next;
}

export default function ReferenceDictionaryScreen() {
  const sortBtnRef = useRef<View>(null);

  const {
    searchQuery,
    setSearchQuery,
    sortMode,
    setSortMode,
    emotionFilter,
    setEmotionFilter,
    filterDraft,
    setFilterDraft,
    resetFilters,
  } = useEmotionDictionaryUi();

  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<SortAnchor | null>(null);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  const searchFiltered = useMemo(() => {
    const q = searchQuery.trim().toLocaleLowerCase("ru");
    if (!q) return emotions;
    return emotions.filter((e) =>
      e.name.toLocaleLowerCase("ru").includes(q),
    );
  }, [searchQuery]);

  const filterApplied = useMemo(
    () => applyEmotionDictionaryFilter(searchFiltered, emotionFilter),
    [searchFiltered, emotionFilter],
  );

  const displayEmotions = useMemo(
    () => sortEmotions(filterApplied, sortMode),
    [filterApplied, sortMode],
  );

  const openSortMenu = () => {
    setFilterPanelOpen(false);
    sortBtnRef.current?.measureInWindow((x, y, width, height) => {
      setSortAnchor({ x, y, width, height });
      setSortMenuOpen(true);
    });
  };

  const closeSortMenu = () => {
    setSortMenuOpen(false);
  };

  const selectSortMode = (mode: EmotionDictionarySortMode) => {
    setSortMode(mode);
    closeSortMenu();
  };

  const openFilterPanel = () => {
    setSortMenuOpen(false);
    setFilterDraft(emotionFilter);
    setFilterPanelOpen(true);
  };

  const applyFilterPanel = (final: EmotionDictionaryFilter) => {
    setEmotionFilter(final);
    setFilterPanelOpen(false);
  };

  const cancelFilterPanel = () => {
    setFilterPanelOpen(false);
  };

  const filtersActive = isEmotionDictionaryFilterActive(emotionFilter);

  const sortIsDefault = sortMode === "alphabet_asc";
  const currentSortOption =
    SORT_OPTIONS.find((opt) => opt.id === sortMode) ?? SORT_OPTIONS[0];

  const screenW = Dimensions.get("window").width;
  const menuWidth = Math.min(screenW - 24, 320);
  const menuTop =
    sortAnchor !== null ? sortAnchor.y + sortAnchor.height + 6 : 120;
  const menuLeft =
    sortAnchor !== null
      ? Math.max(12, Math.min(sortAnchor.x, screenW - menuWidth - 12))
      : 12;

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Поиск по названию"
          placeholderTextColor={colors.subtext}
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.toolbar}>
          <View ref={sortBtnRef} collapsable={false} style={styles.toolBtnWrap}>
            <Pressable
              onPress={openSortMenu}
              style={({ pressed }) => [
                styles.toolBtn,
                styles.toolBtnToolbar,
                !sortIsDefault && styles.toolBtnSortExpanded,
                pressed && styles.toolBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={
                sortIsDefault
                  ? "Сортировка. Открыть список"
                  : `Сортировка: ${currentSortOption.label}. Открыть список`
              }
              accessibilityState={{ expanded: sortMenuOpen }}
            >
              <View
                style={[
                  styles.sortBtnContent,
                  !sortIsDefault && styles.sortBtnContentExpanded,
                ]}
              >
                <View style={styles.sortBtnMainRow}>
                  <Ionicons
                    name="swap-vertical-outline"
                    size={20}
                    color={colors.text}
                  />
                  <Text style={styles.toolBtnText}>Сортировка</Text>
                </View>
                {!sortIsDefault ? (
                  <SortOptionLabel
                    label={currentSortOption.label}
                    direction={currentSortOption.direction}
                    textStyle={styles.sortBtnHint}
                    iconSize={14}
                    iconColor={colors.textThird}
                    centered
                  />
                ) : null}
              </View>
            </Pressable>
          </View>
          <View style={styles.filterGroup}>
            <Pressable
              onPress={openFilterPanel}
              style={({ pressed }) => [
                styles.toolBtn,
                styles.toolBtnToolbar,
                styles.toolBtnInGroup,
                filtersActive && styles.toolBtnFilterActive,
                pressed && styles.toolBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Фильтр. Открыть панель"
              accessibilityState={{ expanded: filterPanelOpen }}
            >
              <Ionicons
                name="funnel-outline"
                size={20}
                color={filtersActive ? colors.surface : colors.text}
              />
              <Text
                style={[
                  styles.toolBtnText,
                  filtersActive && styles.toolBtnTextOnPrimary,
                ]}
              >
                Фильтр
              </Text>
            </Pressable>
            {filtersActive ? (
              <Pressable
                onPress={resetFilters}
                style={({ pressed }) => [
                  styles.toolBtn,
                  styles.toolBtnInGroup,
                  pressed && styles.toolBtnPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel="Сбросить фильтр"
              >
                <Text style={styles.toolBtnText}>Сбросить</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.screenDivider} />

        {displayEmotions.length === 0 ? (
          <Text style={styles.emptyHint}>
            Ничего не найдено — попробуйте другой запрос.
          </Text>
        ) : (
          <EmotionAccordionList items={displayEmotions} />
        )}
      </ScrollView>

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={closeSortMenu}
        statusBarTranslucent
      >
        <View style={styles.modalRoot} pointerEvents="box-none">
          <Pressable
            style={styles.modalBackdrop}
            onPress={closeSortMenu}
            accessibilityLabel="Закрыть меню сортировки"
          />
          <View
            style={[
              styles.sortMenu,
              {
                top: menuTop,
                left: menuLeft,
                width: menuWidth,
              },
            ]}
            pointerEvents="box-none"
          >
            {SORT_OPTIONS.map((opt) => {
              const selected = sortMode === opt.id;
              return (
                <Pressable
                  key={opt.id}
                  onPress={() => selectSortMode(opt.id)}
                  style={({ pressed }) => [
                    styles.sortMenuRow,
                    selected && styles.sortMenuRowSelected,
                    pressed && styles.sortMenuRowPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <View style={styles.sortMenuLabelWrap}>
                    <SortOptionLabel
                      label={opt.label}
                      direction={opt.direction}
                      textStyle={[
                        styles.sortMenuLabel,
                        selected && styles.sortMenuLabelSelected,
                      ]}
                      iconSize={18}
                      iconColor={colors.primary}
                    />
                  </View>
                  {selected ? (
                    <Ionicons name="checkmark" size={22} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>

      <EmotionFilterPanel
        visible={filterPanelOpen}
        draft={filterDraft}
        onChangeDraft={setFilterDraft}
        onApply={applyFilterPanel}
        onCancel={cancelFilterPanel}
        onResetFilters={resetFilters}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
    paddingBottom: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SCROLL_HORIZONTAL_PAD,
    paddingTop: SECTION_GAP,
    paddingBottom: 32,
    gap: SECTION_GAP,
  },
  screenDivider: {
    ...horizontalRule2px(colors.text),
    marginHorizontal: -SCROLL_HORIZONTAL_PAD,
  },
  search: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: "500",
    color: colors.primary,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },
  toolbar: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  toolBtnWrap: {
    flex: 1,
    minWidth: 0,
    alignSelf: "stretch",
  },
  filterGroup: {
    flex: 1,
    minWidth: 0,
    flexDirection: "column",
    gap: 8,
  },
  toolBtnInGroup: {
    alignSelf: "stretch",
  },
  toolBtnToolbar: {
    minHeight: TOOLBAR_SINGLE_BTN_HEIGHT,
    alignSelf: "stretch",
  },
  toolBtnSortExpanded: {
    minHeight: TOOLBAR_SINGLE_BTN_HEIGHT * 1.75,
    flexDirection: "column",
    justifyContent: "center",
    paddingVertical: 10,
  },
  sortBtnContent: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: "100%",
  },
  sortBtnContentExpanded: {
    flex: 1,
    justifyContent: "center",
    gap: 8,
  },
  sortBtnMainRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  sortOptionLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  sortOptionLabelRowCentered: {
    justifyContent: "center",
  },
  sortBtnHint: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.textThird,
    textAlign: "center",
    lineHeight: 16,
    paddingHorizontal: 4,
  },
  toolBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  toolBtnFilterActive: {
    backgroundColor: colors.primary,
  },
  toolBtnPressed: {
    opacity: 0.9,
  },
  toolBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  toolBtnTextOnPrimary: {
    color: colors.surface,
  },
  emptyHint: {
    fontSize: 15,
    color: colors.subtext,
    textAlign: "center",
    lineHeight: 22,
    paddingVertical: 8,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(45, 42, 69, 0.35)",
  },
  sortMenu: {
    position: "absolute",
    zIndex: 2,
    borderRadius: 14,
    backgroundColor: colors.card,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.18)",
    shadowColor: "#2D2A45",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 12,
  },
  sortMenuRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  sortMenuRowSelected: {
    backgroundColor: "rgba(75, 69, 150, 0.06)",
  },
  sortMenuRowPressed: {
    opacity: 0.92,
  },
  sortMenuLabelWrap: {
    flex: 1,
    minWidth: 0,
  },
  sortMenuLabel: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
    flexShrink: 1,
  },
  sortMenuLabelSelected: {
    fontWeight: "600",
  },
});
