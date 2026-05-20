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
  /** На Android blur поля часто опережает onPress — выбор фиксируем по onPressIn / onTouchStart. */
  const selectingRef = useRef(false);
  const lastSelectAtRef = useRef(0);
  const valueRef = useRef(value);
  const inputSlotRef = useRef<View>(null);
  const onRowOverlayActiveChangeRef = useRef(onRowOverlayActiveChange);
  const onInputBlurRef = useRef(onInputBlur);
  onRowOverlayActiveChangeRef.current = onRowOverlayActiveChange;
  onInputBlurRef.current = onInputBlur;
  valueRef.current = value;

  const clearBlurTimeout = useCallback(() => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current);
      blurTimeoutRef.current = null;
    }
  }, []);

  const finishBlur = useCallback(() => {
    setIsFocused(false);
    onRowOverlayActiveChangeRef.current?.(false);
  }, []);

  const selectSuggestion = useCallback(
    (suggestion: string) => {
      const now = Date.now();
      if (now - lastSelectAtRef.current < 350) return;
      lastSelectAtRef.current = now;

      selectingRef.current = true;
      clearBlurTimeout();
      valueRef.current = suggestion;
      onChangeText(suggestion);
      onInputBlurRef.current?.(suggestion);
      setIsFocused(false);

      /** Overlay держим, чтобы тот же тап не попал в «+ Добавить» под списком. */
      setTimeout(() => {
        onRowOverlayActiveChangeRef.current?.(false);
        selectingRef.current = false;
      }, 400);
    },
    [clearBlurTimeout, onChangeText],
  );

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

  const showFieldPlaceholder =
    editable && !isFocused && !String(value).trim();

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
      clearBlurTimeout();
      onRowOverlayActiveChangeRef.current?.(false);
    };
  }, [clearBlurTimeout]);

  return (
    <View style={[styles.root, isFocused && styles.rootFocused]}>
      <View ref={inputSlotRef} style={styles.inputSlot}>
        <TextInput
          style={[styles.inputInSlot, inputStyle]}
          value={value}
          editable={editable}
          placeholder=""
          onFocus={() => {
            clearBlurTimeout();
            onRowOverlayActiveChangeRef.current?.(true);
            setIsFocused(true);
            requestAnimationFrame(() => updateAutoPlacement());
          }}
          onBlur={() => {
            clearBlurTimeout();
            if (selectingRef.current) return;
            blurTimeoutRef.current = setTimeout(() => {
              blurTimeoutRef.current = null;
              if (selectingRef.current) return;
              onInputBlurRef.current?.(valueRef.current);
              finishBlur();
            }, 250);
          }}
          onChangeText={onChangeText}
        />

        {showFieldPlaceholder ? (
          <View style={styles.fieldPlaceholderWrap} pointerEvents="none">
            <Text style={styles.fieldPlaceholderText}>{placeholder}</Text>
          </View>
        ) : null}

        {shouldShowSuggestions ? (
          <View
            style={[
              styles.suggestions,
              resolvedPlacement === "above"
                ? styles.suggestionsAbove
                : styles.suggestionsBelow,
            ]}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <ScrollView
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
              bounces={false}
              style={styles.suggestionsScroll}
              contentContainerStyle={styles.suggestionsScrollContent}
            >
              {suggestions.map((suggestion) => (
                <Pressable
                  key={suggestion}
                  onTouchStart={() => {
                    selectingRef.current = true;
                    clearBlurTimeout();
                  }}
                  onPressIn={() => selectSuggestion(suggestion)}
                  onPress={() => selectSuggestion(suggestion)}
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
  fieldPlaceholderWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  fieldPlaceholderText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.subtext,
  },
  suggestions: {
    position: "absolute",
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
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
    borderBottomColor: "rgba(89, 77, 157, 0.25)",
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
