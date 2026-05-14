import { colors } from "@/constants/colors";
import { findEmotionMatches } from "@/data/emotions";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from "react-native";

type SuggestionsPlacement = "below" | "above" | "auto";

type EmotionAutocompleteInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  onInputBlur?: (value: string) => void;
  editable?: boolean;
  placeholder?: string;
  inputStyle?: TextInputProps["style"];
  maxSuggestions?: number;
  /**
   * `below` / `above` — фиксированно.
   * `auto` — если центр поля в нижней половине экрана, список над полем, иначе под.
   */
  suggestionsPlacement?: SuggestionsPlacement;
  /**
   * `true` — сразу при фокусе поля (до списка), `false` — после blur / выбора из списка.
   * Нужен родителю (шаг «Эмоции»), чтобы поднять строку по z-index без мигания.
   */
  onRowOverlayActiveChange?: (active: boolean) => void;
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
  onRowOverlayActiveChange,
}: EmotionAutocompleteInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [autoPlacement, setAutoPlacement] = useState<"below" | "above">("below");
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputSlotRef = useRef<View>(null);
  const onRowOverlayActiveChangeRef = useRef(onRowOverlayActiveChange);
  onRowOverlayActiveChangeRef.current = onRowOverlayActiveChange;

  const updateAutoPlacement = useCallback(() => {
    if (suggestionsPlacement !== "auto") return;
    inputSlotRef.current?.measureInWindow((x, y, w, h) => {
      const midY = y + h / 2;
      const sh = Dimensions.get("window").height;
      setAutoPlacement(midY > sh / 2 ? "above" : "below");
    });
  }, [suggestionsPlacement]);

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

  const resolvedPlacement: "below" | "above" =
    suggestionsPlacement === "auto"
      ? autoPlacement
      : suggestionsPlacement;

  useEffect(() => {
    if (!isFocused || suggestionsPlacement !== "auto") return;
    const id = requestAnimationFrame(() => updateAutoPlacement());
    return () => cancelAnimationFrame(id);
  }, [value, isFocused, suggestionsPlacement, updateAutoPlacement]);

  useEffect(() => {
    return () => {
      onRowOverlayActiveChangeRef.current?.(false);
    };
  }, []);

  return (
    <View style={[styles.root, isFocused && styles.rootFocused]}>
      <View ref={inputSlotRef} style={styles.inputSlot}>
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
            onRowOverlayActiveChangeRef.current?.(true);
            setIsFocused(true);
            requestAnimationFrame(() => updateAutoPlacement());
          }}
          onBlur={() => {
            onInputBlur?.(value);
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
              onRowOverlayActiveChangeRef.current?.(false);
            }, 100);
          }}
          onChangeText={onChangeText}
        />

        {shouldShowSuggestions ? (
          <View
            style={[
              styles.suggestions,
              resolvedPlacement === "above"
                ? styles.suggestionsAbove
                : styles.suggestionsBelow,
            ]}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              bounces={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onPress={() => {
                    onRowOverlayActiveChangeRef.current?.(false);
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
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    borderWidth: 2,
    borderColor: colors.primary,
    overflow: "hidden",
    zIndex: 100000,
    elevation: 10000,
  },
  suggestionsScroll: {
    maxHeight: 180,
  },
  suggestionsScrollContent: {
    paddingVertical: 8,
    paddingHorizontal: 14,
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
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(75, 69, 150, 0.15)",
  },
  suggestionItemPressed: {
    backgroundColor: "#E4E9F7",
  },
  suggestionText: {
    color: colors.primary,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
