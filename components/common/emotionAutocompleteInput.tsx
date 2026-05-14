import { colors } from "@/constants/colors";
import { findEmotionMatches } from "@/data/emotions";
import { useMemo, useRef, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type EmotionAutocompleteInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onInputBlur?: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  inputStyle?: TextInputProps["style"];
  maxSuggestions?: number;
  /** По умолчанию список под полем; `above` — над полем (оверлей, без сдвига вёрстки). */
  suggestionsPlacement?: "below" | "above";
};

export default function EmotionAutocompleteInput({
  value,
  onChangeText,
  onInputBlur,
  editable = true,
  placeholder = "эмоция",
  inputStyle,
  maxSuggestions = 6,
  suggestionsPlacement = "below",
}: EmotionAutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = useMemo(() => {
    if (!editable) return [];
    return findEmotionMatches(value, maxSuggestions);
  }, [editable, maxSuggestions, value]);

  const hasExactMatch =
    value.trim().length > 0 &&
    suggestions.some(
      (candidate) =>
        candidate.trim().toLocaleLowerCase("ru") ===
        value.trim().toLocaleLowerCase("ru"),
    );

  const shouldShowSuggestions =
    editable && isFocused && suggestions.length > 0 && !hasExactMatch;

  return (
    <View style={[styles.root, isFocused && styles.rootFocused]}>
      <View style={styles.inputSlot}>
        <TextInput
          style={[styles.inputInSlot, inputStyle]}
          value={value}
          editable={editable}
          placeholder={placeholder}
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
              blurTimeoutRef.current = null;
            }
            setIsFocused(true);
          }}
          onBlur={() => {
            onInputBlur?.(value);
            blurTimeoutRef.current = setTimeout(() => setIsFocused(false), 100);
          }}
          onChangeText={onChangeText}
        />

        {shouldShowSuggestions ? (
          <View
            style={[
              styles.suggestions,
              suggestionsPlacement === "above"
                ? styles.suggestionsAbove
                : styles.suggestionsBelow,
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              bounces={false}
              style={styles.suggestionsScroll}
            >
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    onChangeText(suggestion);
                    setIsFocused(false);
                  }}
                  style={({ pressed }) => [
                    styles.suggestionItem,
                    pressed && styles.suggestionItemPressed,
                  ]}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    position: "relative",
    zIndex: 1,
  },
  rootFocused: {
    zIndex: 99999,
    elevation: 9999,
  },
  inputSlot: {
    position: "relative",
    alignSelf: "stretch",
    width: "100%",
  },
  inputInSlot: {
    width: "100%",
  },
  suggestions: {
    position: "absolute",
    left: 0,
    right: 0,
    borderWidth: 1,
    borderColor: "#D6DCE8",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    zIndex: 100000,
    elevation: 10000,
  },
  suggestionsScroll: {
    maxHeight: 220,
  },
  suggestionsBelow: {
    top: "100%",
    marginTop: 4,
  },
  suggestionsAbove: {
    bottom: "100%",
    marginBottom: 4,
  },
  suggestionItem: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5EAF3",
  },
  suggestionItemPressed: {
    backgroundColor: colors.background,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 14,
  },
});
