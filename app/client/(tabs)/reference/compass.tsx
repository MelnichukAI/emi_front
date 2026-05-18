import CompassCard from "@/components/compass/CompassCard";
import CompassFilterToolbar from "@/components/compass/CompassFilterToolbar";
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

import { useMemo, useState } from "react";

import {
  Dimensions,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

const SCREEN_HORIZONTAL_PADDING = 40;

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
    SCREEN_HORIZONTAL_PADDING * 2 -
    36;

  const suggestedEmotions =
    useMemo(() => {
      return getCompassSuggestedEmotions(
        selectedCells,
        emotionFilter,
      );
    }, [
      selectedCells,
      emotionFilter,
    ]);
  console.log(toggleCompassCell);
  console.log(typeof toggleCompassCell);
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

        <CompassFilterToolbar
          filtersActive={
            filtersActive
          }
          onOpenFilters={() =>
            setFilterPanelOpen(true)
          }
          onResetFilters={
            resetFilters
          }
        />

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
});