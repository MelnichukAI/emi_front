import CompassCard from "@/components/compass/CompassCard";
import CompassGrid from "@/components/compass/CompassGrid";
import SuggestedEmotionList from "@/components/compass/SuggestedEmotionList";

import {
  toggleCompassCell,
} from "@/components/compass/utils/cell";

import {
  getCompassSuggestedEmotions,
} from "@/components/compass/utils/filtering";

import type {
  CompassSelectedCell,
} from "@/components/compass/types";

import EmotionFilterPanel from "@/components/emotionDictionary/EmotionFilterPanel";

import { colors } from "@/constants/colors";

import {
  EMPTY_EMOTION_DICTIONARY_FILTER,
  isEmotionDictionaryFilterActive,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";

import { Ionicons } from "@expo/vector-icons";

import {
  useMemo,
  useState,
} from "react";

import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const SCREEN_HORIZONTAL_PADDING = 40;

type CompassSortMode =
  | "alphabet_asc"
  | "alphabet_desc"
  | "energy_asc"
  | "energy_desc"
  | "valence_asc"
  | "valence_desc";

type SortOption = {
  id: CompassSortMode;

  label: string;

  direction?: "up" | "down";
};

const SORT_OPTIONS: SortOption[] = [
  {
    id: "alphabet_asc",
    label: "По алфавиту от А до Я",
  },

  {
    id: "alphabet_desc",
    label: "По алфавиту от Я до А",
  },

  {
    id: "energy_asc",
    label: "По энергии",
    direction: "up",
  },

  {
    id: "energy_desc",
    label: "По энергии",
    direction: "down",
  },

  {
    id: "valence_asc",
    label: "По валентности",
    direction: "up",
  },

  {
    id: "valence_desc",
    label: "По валентности",
    direction: "down",
  },
];

function compareNullableNumberAsc(
  a: number | null,
  b: number | null,
): number {
  if (a === null && b === null)
    return 0;

  if (a === null) return 1;

  if (b === null) return -1;

  return a - b;
}

function sortEmotions(
  list: any[],
  mode: CompassSortMode,
) {
  const next = [...list];

  switch (mode) {
    case "alphabet_asc":
      next.sort((a, b) =>
        a.name.localeCompare(
          b.name,
          "ru",
        ),
      );
      break;

    case "alphabet_desc":
      next.sort((a, b) =>
        b.name.localeCompare(
          a.name,
          "ru",
        ),
      );
      break;

    case "energy_asc":
      next.sort((a, b) =>
        compareNullableNumberAsc(
          a.energy,
          b.energy,
        ),
      );
      break;

    case "energy_desc":
      next.sort(
        (a, b) =>
          -compareNullableNumberAsc(
            a.energy,
            b.energy,
          ),
      );
      break;

    case "valence_asc":
      next.sort((a, b) =>
        compareNullableNumberAsc(
          a.valence,
          b.valence,
        ),
      );
      break;

    case "valence_desc":
      next.sort(
        (a, b) =>
          -compareNullableNumberAsc(
            a.valence,
            b.valence,
          ),
      );
      break;
  }

  return next;
}

export default function CompassScreen() {
  const [selectedCells, setSelectedCells] =
    useState<
      CompassSelectedCell[]
    >([]);

  const [
    filterPanelOpen,
    setFilterPanelOpen,
  ] = useState(false);

  const [
    sortMenuOpen,
    setSortMenuOpen,
  ] = useState(false);

  const [sortMode, setSortMode] =
    useState<CompassSortMode>(
      "alphabet_asc",
    );

  const [
    emotionFilter,
    setEmotionFilter,
  ] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );

  const [
    filterDraft,
    setFilterDraft,
  ] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );

  const compassSize =
    Dimensions.get("window").width -
    SCREEN_HORIZONTAL_PADDING * 2;

  const suggestedEmotions =
    useMemo(() => {
      const filtered =
        getCompassSuggestedEmotions(
          selectedCells,
          emotionFilter,
        );

      return sortEmotions(
        filtered,
        sortMode,
      );
    }, [
      selectedCells,
      emotionFilter,
      sortMode,
    ]);

  const toggleCell = (
    valence: number,
    energy: number,
  ) => {
    setSelectedCells((prev) =>
      toggleCompassCell(
        prev,
        valence,
        energy,
      ),
    );
  };

  const resetFilters = () => {
    setEmotionFilter(
      EMPTY_EMOTION_DICTIONARY_FILTER,
    );

    setFilterDraft(
      EMPTY_EMOTION_DICTIONARY_FILTER,
    );
  };

  const filtersActive =
    isEmotionDictionaryFilterActive(
      emotionFilter,
    );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <CompassCard>
          <CompassGrid
            size={compassSize}
            selectedCells={
              selectedCells
            }
            onToggleCell={
              toggleCell
            }
          />
        </CompassCard>

<View style={styles.toolbar}>
  <Pressable
    onPress={() =>
      setSortMenuOpen(true)
    }
    style={[
      styles.toolbarBtn,
      styles.toolbarBtnLeft,
    ]}
  >
    <Ionicons
      name="swap-vertical-outline"
      size={18}
      color={colors.text}
    />

    <Text style={styles.toolbarBtnText}>
      Сортировка
    </Text>
  </Pressable>

  <View style={styles.toolbarRight}>
    <Pressable
      onPress={() =>
        setFilterPanelOpen(true)
      }
      style={[
        styles.toolbarBtn,
        filtersActive &&
          styles.toolbarBtnActive,
      ]}
    >
      <Ionicons
        name="funnel-outline"
        size={18}
        color={
          filtersActive
            ? colors.surface
            : colors.text
        }
      />

      <Text
        style={[
          styles.toolbarBtnText,
          filtersActive &&
            styles.toolbarBtnTextActive,
        ]}
      >
        Фильтр
      </Text>
    </Pressable>

    {filtersActive ? (
      <Pressable
        onPress={resetFilters}
        style={styles.resetBtn}
      >
        <Text style={styles.resetBtnText}>
          Сбросить
        </Text>
      </Pressable>
    ) : null}
  </View>
</View>

        <SuggestedEmotionList
          emotions={
            suggestedEmotions
          }
          empty={
            selectedCells.length ===
            0
          }
        />
      </ScrollView>

      <Modal
        visible={sortMenuOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setSortMenuOpen(false)
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setSortMenuOpen(false)
          }
        >
          <View style={styles.sortMenu}>
            {SORT_OPTIONS.map(
              (opt) => {
                const selected =
                  sortMode ===
                  opt.id;

                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => {
                      setSortMode(
                        opt.id,
                      );

                      setSortMenuOpen(
                        false,
                      );
                    }}
                    style={
                      styles.sortMenuRow
                    }
                  >
                    <View
                      style={
                        styles.sortLabelRow
                      }
                    >
                      <Text
                        style={[
                          styles.sortMenuText,

                          selected &&
                            styles.sortMenuTextSelected,
                        ]}
                      >
                        {opt.label}
                      </Text>

                      {opt.direction ? (
                        <Ionicons
                          name={
                            opt.direction ===
                            "up"
                              ? "chevron-up"
                              : "chevron-down"
                          }
                          size={16}
                          color={
                            colors.primary
                          }
                        />
                      ) : null}
                    </View>

                    {selected ? (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={
                          colors.primary
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              },
            )}
          </View>
        </Pressable>
      </Modal>

      <EmotionFilterPanel
        visible={filterPanelOpen}
        draft={filterDraft}
        onChangeDraft={
          setFilterDraft
        }
        onApply={(final) => {
          setEmotionFilter(final);

          setFilterPanelOpen(false);
        }}
        onCancel={() =>
          setFilterPanelOpen(false)
        }
        onResetFilters={
          resetFilters
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,

    backgroundColor:
      colors.background,
  },

  content: {
    paddingTop: 18,

    paddingBottom: 40,
  },

toolbar: {
  flexDirection: "row",

  alignItems: "stretch",

  gap: 10,

  paddingHorizontal: 20,

  marginBottom: 20,
},

toolbarRight: {
  flex: 1,

  gap: 8,
},

toolbarBtn: {
  flex: 1,

  minHeight: 48,

  flexDirection: "row",

  alignItems: "center",

  justifyContent: "center",

  gap: 8,

  borderRadius: 14,

  borderWidth: 1,

  borderColor:
    colors.primary,

  backgroundColor:
    colors.surface,

  paddingHorizontal: 12,
},

toolbarBtnLeft: {
  flex: 1,
},

toolbarBtnActive: {
  backgroundColor:
    colors.primary,
},

toolbarBtnText: {
  fontSize: 15,

  fontWeight: "600",

  color: colors.text,
},

toolbarBtnTextActive: {
  color: colors.surface,
},

resetBtn: {
  minHeight: 48,

  alignItems: "center",

  justifyContent: "center",

  borderRadius: 14,

  backgroundColor:
    colors.surface,

  borderWidth: 1,

  borderColor:
    colors.primary,
},

resetBtnText: {
  fontSize: 15,

  fontWeight: "600",

  color: colors.primary,
},

  modalBackdrop: {
    flex: 1,

    backgroundColor:
      "rgba(0,0,0,0.2)",

    justifyContent: "center",

    paddingHorizontal: 20,
  },

  sortMenu: {
    borderRadius: 18,

    backgroundColor:
      colors.card,

    paddingVertical: 8,
  },

  sortMenuRow: {
    flexDirection: "row",

    alignItems: "center",

    justifyContent:
      "space-between",

    paddingHorizontal: 16,

    paddingVertical: 14,
  },

  sortLabelRow: {
    flexDirection: "row",

    alignItems: "center",

    gap: 6,
  },

  sortMenuText: {
    fontSize: 15,

    color: colors.text,
  },

  sortMenuTextSelected: {
    fontWeight: "700",

    color: colors.primary,
  },
});