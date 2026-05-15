import {
  EMPTY_EMOTION_DICTIONARY_FILTER,
  type EmotionDictionaryFilter,
} from "@/lib/emotion-dictionary-filter";
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

export type EmotionDictionarySortMode =
  | "alphabet_asc"
  | "alphabet_desc"
  | "energy_asc"
  | "energy_desc"
  | "valence_asc"
  | "valence_desc";

type EmotionDictionaryUiContextValue = {
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  sortMode: EmotionDictionarySortMode;
  setSortMode: React.Dispatch<React.SetStateAction<EmotionDictionarySortMode>>;
  emotionFilter: EmotionDictionaryFilter;
  setEmotionFilter: React.Dispatch<React.SetStateAction<EmotionDictionaryFilter>>;
  filterDraft: EmotionDictionaryFilter;
  setFilterDraft: React.Dispatch<React.SetStateAction<EmotionDictionaryFilter>>;
  resetFilters: () => void;
};

const EmotionDictionaryUiContext =
  createContext<EmotionDictionaryUiContextValue | null>(null);

/** Сохраняет поиск, сортировку и фильтр словаря при переключении Компас ↔ Словарь. */
export function EmotionDictionaryUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] =
    useState<EmotionDictionarySortMode>("alphabet_asc");
  const [emotionFilter, setEmotionFilter] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );
  const [filterDraft, setFilterDraft] = useState<EmotionDictionaryFilter>(
    EMPTY_EMOTION_DICTIONARY_FILTER,
  );

  const resetFilters = useCallback(() => {
    setEmotionFilter(EMPTY_EMOTION_DICTIONARY_FILTER);
    setFilterDraft(EMPTY_EMOTION_DICTIONARY_FILTER);
  }, []);

  const value = useMemo(
    () => ({
      searchQuery,
      setSearchQuery,
      sortMode,
      setSortMode,
      emotionFilter,
      setEmotionFilter,
      filterDraft,
      setFilterDraft,
      resetFilters,
    }),
    [emotionFilter, filterDraft, resetFilters, searchQuery, sortMode],
  );

  return (
    <EmotionDictionaryUiContext.Provider value={value}>
      {children}
    </EmotionDictionaryUiContext.Provider>
  );
}

export function useEmotionDictionaryUi() {
  const ctx = useContext(EmotionDictionaryUiContext);
  if (!ctx) {
    throw new Error(
      "useEmotionDictionaryUi must be used within EmotionDictionaryUiProvider",
    );
  }
  return ctx;
}
