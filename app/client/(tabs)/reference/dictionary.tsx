import EmotionAccordionList from "@/components/emotionDictionary/EmotionAccordionList";
import EmotionFilterPanel from "@/components/emotionDictionary/EmotionFilterPanel";
import { colors } from "@/constants/colors";
import { emotions, type Emotion } from "@/data/emotions";
import {
  applyEmotionDictionaryFilter,
  EMPTY_EMOTION_DICTIONARY_FILTER,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";
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

type EmotionSortMode =
  | "alphabet_asc"
  | "alphabet_desc"
  | "energy_asc"
  | "energy_desc"
  | "valence_asc"
  | "valence_desc";

type SortAnchor = { x: number; y: number; width: number; height: number };

const SORT_OPTIONS: { id: EmotionSortMode; label: string }[] = [
  { id: "alphabet_asc", label: "По алфавиту от А до Я" },
  { id: "alphabet_desc", label: "По алфавиту от Я до А" },
  { id: "energy_asc", label: "По энергии ↑" },
  { id: "energy_desc", label: "По энергии ↓" },
  { id: "valence_asc", label: "По валентности ↑" },
  { id: "valence_desc", label: "По валентности ↓" },
];

function compareNullableNumberAsc(
  a: number | null,
  b: number | null,
): number {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return a - b;
}

function sortEmotions(list: Emotion[], mode: EmotionSortMode): Emotion[] {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<EmotionSortMode>("alphabet_asc");
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [sortAnchor, setSortAnchor] = useState<SortAnchor | null>(null);

  const [emotionFilter, setEmotionFilter] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );
  const [filterDraft, setFilterDraft] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );
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

  const selectSortMode = (mode: EmotionSortMode) => {
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
                pressed && styles.toolBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Сортировка. Открыть список"
              accessibilityState={{ expanded: sortMenuOpen }}
            >
              <Ionicons
                name="swap-vertical-outline"
                size={20}
                color={colors.primary}
              />
              <Text style={styles.toolBtnText}>Сортировка</Text>
            </Pressable>
          </View>
          <Pressable
            onPress={openFilterPanel}
            style={({ pressed }) => [styles.toolBtn, pressed && styles.toolBtnPressed]}
            accessibilityRole="button"
            accessibilityLabel="Фильтр. Открыть панель"
            accessibilityState={{ expanded: filterPanelOpen }}
          >
            <Ionicons name="funnel-outline" size={20} color={colors.primary} />
            <Text style={styles.toolBtnText}>Фильтр</Text>
          </Pressable>
        </View>

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
                  <Text
                    style={[styles.sortMenuLabel, selected && styles.sortMenuLabelSelected]}
                    numberOfLines={3}
                  >
                    {opt.label}
                  </Text>
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
        onResetFilters={() => setEmotionFilter(EMPTY_EMOTION_DICTIONARY_FILTER)}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    gap: 14,
  },
  search: {
    backgroundColor: colors.card,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.text,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },
  toolbar: {
    flexDirection: "row",
    gap: 10,
  },
  toolBtnWrap: {
    flex: 1,
  },
  toolBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.card,
  },
  toolBtnPressed: {
    opacity: 0.9,
  },
  toolBtnText: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.primary,
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
  sortMenuLabel: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    lineHeight: 21,
  },
  sortMenuLabelSelected: {
    fontWeight: "600",
  },
});
