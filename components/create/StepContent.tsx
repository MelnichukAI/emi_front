import ChatIcon from "@/assets/icons/aichat.svg";
import EmotionAutocompleteInput from "@/components/common/emotionAutocompleteInput";
import { CREATE_INFO_RIGHT_INSET } from "@/constants/create-screen-layout";
import { isKnownEmotionName } from "@/data/emotions";
import {
  buildDiaryDraftChatContext,
  diaryDraftHasSubstantiveChatContext,
  stashDiaryDraftContextForChat,
} from "@/lib/diary-draft-chat-bridge";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors } from "../../constants/colors";
import { DIARY_ENTRY_TAG_GROUPS } from "../../constants/diaryEntryTags";

/** Шаг 4: чуть шире контент относительно padding колонки create. */
const STEP4_HORIZONTAL_BLEED = 12;

/** Одна высота поля эмоции, процента и кнопки «+ Добавить». */
const STEP4_ROW_CONTROL_HEIGHT = 40;

type Item = {
  text: string;
  percent: string;
};

function hasDuplicateEmotionText(items: { text: string }[]) {
  const seen = new Set<string>();
  for (const item of items) {
    const n = item.text.trim().toLocaleLowerCase("ru");
    if (n.length === 0) continue;
    if (seen.has(n)) return true;
    seen.add(n);
  }
  return false;
}

type Props = {
  step: number;

  form: {
    situation: string;
    thought: string;
    body: string;
    behavior: string;
    behaviorAlt: string;
  };
  setForm: React.Dispatch<React.SetStateAction<Props["form"]>>;

  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;

  selectedTags: Set<string>;
  setSelectedTags: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const chatFabShadow = Platform.select({
  web: {
    boxShadow: "0 2px 8px rgba(75, 69, 150, 0.12)",
  },
  ios: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  default: {
    elevation: 3,
  },
});

function StepContent({
  step,
  form,
  setForm,
  items,
  setItems,
  selectedTags,
  setSelectedTags,
}: Props) {
  const router = useRouter();
  const [emotionSuggestionsRow, setEmotionSuggestionsRow] = useState<
    number | null
  >(null);

  useEffect(() => {
    if (step !== 4) {
      setEmotionSuggestionsRow(null);
    }
  }, [step]);

  const showTitleDivider =
    step === 6 || (step === 4 && items.length >= 10);

  const openChatTab = () => {
    if (diaryDraftHasSubstantiveChatContext({ form, items, selectedTags })) {
      stashDiaryDraftContextForChat(
        buildDiaryDraftChatContext({ step, form, items, selectedTags }),
      );
    } else {
      stashDiaryDraftContextForChat("");
    }
    router.navigate("/client/chat");
  };

  const renderTitleRow = (label: string) => (
    <View
      style={[
        styles.titleRow,
        showTitleDivider && styles.titleRowDividerVisible,
      ]}
    >
      <Text style={[styles.title, styles.titleInRow]} numberOfLines={3}>
        {label}
      </Text>
      <Pressable
        style={[styles.chatButton, chatFabShadow]}
        onPress={openChatTab}
        accessibilityRole="button"
        accessibilityLabel="Открыть чат"
      >
        <ChatIcon width={26} height={26} color={colors.primary} />
      </Pressable>
    </View>
  );

  const addItem = () => {
    if (emotionSuggestionsRow !== null) return;

    const hasTextNoPercent = items.some(
      (item) => item.text.trim().length > 0 && item.percent.trim().length === 0,
    );
    if (hasTextNoPercent) {
      alert("Сначала заполните текущее поле эмоции и процента.");
      return;
    }
    const hasUnknownEmotion = items.some(
      (item) =>
        item.text.trim().length > 0 && !isKnownEmotionName(item.text),
    );
    if (hasUnknownEmotion) {
      alert("Выберите эмоцию из списка.");
      return;
    }
    if (items.some((item) => !item.text.trim())) {
      alert("Заполните или удалите пустые строки.");
      return;
    }
    if (hasDuplicateEmotionText(items)) {
      alert("Нельзя выбрать одну и ту же эмоцию дважды.");
      return;
    }
    setItems((prev: Item[]) => [...prev, { text: "", percent: "100" }]);
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    if (field === "text") {
      const nextItems = items.map((it, i) =>
        i === index ? { ...it, text: value } : it,
      );
      if (hasDuplicateEmotionText(nextItems)) {
        alert("Эта эмоция уже выбрана в соседнем поле.");
        return;
      }
    }
    const updated: Item[] = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev: Item[]) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev: Set<string>) => {
      const next = new Set(prev);

      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }

      return next;
    });
  };

  if (step === 1) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Ситуация")}
        <View style={styles.inputWrap}>
          <MultilineInputWithOverlayPlaceholder
            placeholder="Введите описание ситуации..."
            multiline
            value={form.situation}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, situation: text }))
            }
          />
        </View>
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Мысли")}
        <View style={styles.inputWrap}>
          <MultilineInputWithOverlayPlaceholder
            placeholder="Введите мысли, которые возникли"
            multiline
            value={form.thought}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, thought: text }))
            }
          />
        </View>
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Тело")}
        <View style={styles.inputWrap}>
          <MultilineInputWithOverlayPlaceholder
            placeholder="Введите описание физических ощущений"
            multiline
            value={form.body}
            onChangeText={(text) => setForm((prev) => ({ ...prev, body: text }))}
          />
        </View>
      </View>
    );
  }

  if (step === 4) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Эмоции")}
        <View style={styles.inputWrap}>
          <ScrollView
            style={[styles.scroll, styles.step4Scroll]}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="always"
            removeClippedSubviews={false}
          >
            {items.map((item: Item, index: number) => {
              const rowBoosted = emotionSuggestionsRow === index;
              const canRemoveRow = items.length > 1;
              return (
              <View
                key={index}
                style={[
                  styles.row,
                  {
                    zIndex: rowBoosted ? 50000 : 10 + index,
                    elevation: rowBoosted ? 20000 : 4 + index,
                  },
                ]}
              >
                <View style={[styles.textWrapper, styles.textWrapperCompact]}>
                  <EmotionAutocompleteInput
                    value={item.text}
                    onChangeText={(text) => updateItem(index, "text", text)}
                    inputStyle={[styles.smallInput, styles.smallInputCompact]}
                    placeholder="Начните вводить"
                    maxSuggestions={50}
                    suggestionsPlacement="auto"
                    onRowOverlayActiveChange={(active) => {
                      setEmotionSuggestionsRow((prev) => {
                        if (active) return index;
                        return prev === index ? null : prev;
                      });
                    }}
                  />
                </View>

                <PercentInputWithPlaceholder
                  value={item.percent}
                  onChangeText={(text) => updateItem(index, "percent", text)}
                />

                <Pressable
                  onPress={() => removeItem(index)}
                  disabled={!canRemoveRow}
                  hitSlop={canRemoveRow ? 6 : 0}
                  style={{ alignSelf: "center" }}
                >
                  <Text
                    style={[
                      styles.deleteBtn,
                      styles.deleteBtnCompact,
                      {
                        color: canRemoveRow
                          ? colors.text
                          : colors.subtext,
                      },
                    ]}
                  >
                    ✕
                  </Text>
                </Pressable>
              </View>
            );
            })}

            <TouchableOpacity
              onPress={addItem}
              style={styles.addBtn}
              disabled={emotionSuggestionsRow !== null}
              activeOpacity={emotionSuggestionsRow !== null ? 1 : 0.65}
            >
              <Text style={styles.addText}>+ Добавить</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (step === 5) {
    return (
      <View style={[styles.container, styles.step5Container]}>
        {renderTitleRow("Поведение")}
        <View style={styles.step5MainSurface}>
          <View style={styles.step5InputWrap}>
            <MultilineInputWithOverlayPlaceholder
              hostStyle={styles.step5InputHost}
              style={styles.step5InputInner}
              placeholder="Введите, описание ваших действий"
              multiline
              value={form.behavior}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, behavior: text }))
              }
            />
          </View>

          <Text style={[styles.title, styles.step5SecondTitle]}>
            В будущем
          </Text>

          <View style={styles.step5InputWrap}>
            <MultilineInputWithOverlayPlaceholder
              hostStyle={styles.step5InputHost}
              style={styles.step5InputInner}
              placeholder="Как бы вы хотели поступить в следующий раз?"
              multiline
              value={form.behaviorAlt}
              onChangeText={(text) =>
                setForm((prev) => ({ ...prev, behaviorAlt: text }))
              }
            />
          </View>
        </View>
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Теги")}
        <View style={styles.inputWrap}>
          <ScrollView
            style={styles.tagScrollContainer}
            contentContainerStyle={styles.tagScrollContent}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
          >
            {DIARY_ENTRY_TAG_GROUPS.map((category) => (
              <View
                key={category.title}
                style={styles.categoryBlock}
                collapsable={false}
              >
                <Text style={styles.categoryTitle}>{category.title}</Text>

                <View style={styles.tagsWrap} collapsable={false}>
                  {category.tags.map((tag) => {
                    const isActive = selectedTags.has(tag);

                    return (
                      <Pressable
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={({ pressed }) => [
                          styles.tag,
                          isActive && styles.tagActive,
                          pressed && styles.tagPressed,
                        ]}
                      >
                        <Text
                          style={[
                            styles.tagText,
                            isActive && styles.tagTextActive,
                          ]}
                        >
                          {tag}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 14,
    color: colors.text,
    letterSpacing: -0.3,
  },

  titleInRow: {
    flex: 1,
    minWidth: 0,
    marginBottom: 0,
    marginRight: 4,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    alignSelf: "stretch",
    marginHorizontal: -CREATE_INFO_RIGHT_INSET,
    paddingHorizontal: CREATE_INFO_RIGHT_INSET,
    paddingBottom: 6,
    marginBottom: 0,
    backgroundColor: colors.background,
    borderBottomWidth: 0,
    zIndex: 0,
    elevation: 0,
  },

  titleRowDividerVisible: {
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    /** Выше строк шага 4 (zIndex до 50k, elevation до 20k при автодополнении). */
    zIndex: 60_000,
    elevation: 20_001,
  },

  titleFollowUp: {
    marginTop: 8,
  },

  /** Под линией заголовка — тот же фон экрана, без отступа (иначе видна «вторая полоса» под линией). */
  inputWrap: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    backgroundColor: colors.background,
    paddingTop: 0,
    zIndex: 0,
    elevation: 0,
  },

  chatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    marginTop: 2,
    transform: [{ translateY: -18 }],
  },

  tagScrollContainer: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },

  tagScrollContent: {
    paddingTop: 4,
    paddingBottom: 16,
  },

  /**
   * Шаги 1–3: обёртка под долю высоты; поле и оверлей-подсказка (font 400) внутри.
   */
  inputHost: {
    alignSelf: "flex-start",
    width: "100%",
    height: "42%",
    minHeight: 0,
    position: "relative",
  },

  inputInner: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    padding: 16,
    paddingTop: 16,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: colors.primary,
  },

  overlayPlaceholder: {
    position: "absolute",
    left: 16,
    top: 16,
    right: 16,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "400",
    color: colors.subtext,
  },

  row: {
    position: "relative",
    flexDirection: "row",
    alignItems: "stretch",
    marginBottom: 8,
  },

  textWrapper: {
    flex: 1,
    marginRight: 6,
    alignSelf: "stretch",
    justifyContent: "center",
  },

  textWrapperCompact: {
    marginRight: 4,
  },

  smallInput: {
    width: "100%",
    height: STEP4_ROW_CONTROL_HEIGHT,
    minHeight: STEP4_ROW_CONTROL_HEIGHT,
    maxHeight: STEP4_ROW_CONTROL_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 10,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.primary,
    textAlignVertical: "center",
  },

  smallInputCompact: {
    paddingHorizontal: 8,
  },

  percentInputHost: {
    position: "relative",
    width: 56,
    marginRight: 6,
    height: STEP4_ROW_CONTROL_HEIGHT,
    minHeight: STEP4_ROW_CONTROL_HEIGHT,
    alignSelf: "stretch",
    justifyContent: "center",
  },

  percentInputHostCompact: {
    width: 48,
    marginRight: 4,
  },

  percentInput: {
    width: "100%",
    height: STEP4_ROW_CONTROL_HEIGHT,
    minHeight: STEP4_ROW_CONTROL_HEIGHT,
    maxHeight: STEP4_ROW_CONTROL_HEIGHT,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 0,
    paddingHorizontal: 8,
    textAlign: "center",
    textAlignVertical: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "500",
    color: colors.primary,
  },

  percentInputCompact: {
    paddingHorizontal: 6,
  },

  percentPlaceholderWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },

  percentPlaceholderText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: "400",
    color: colors.subtext,
  },

  addBtn: {
    marginTop: 8,
    height: STEP4_ROW_CONTROL_HEIGHT,
    minHeight: STEP4_ROW_CONTROL_HEIGHT,
    maxHeight: STEP4_ROW_CONTROL_HEIGHT,
    paddingVertical: 0,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
  },

  addText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 15,
  },

  deleteBtn: {
    fontSize: 18,
    paddingHorizontal: 6,
  },

  deleteBtnCompact: {
    paddingHorizontal: 3,
  },

  categoryBlock: {
    width: "100%",
    marginBottom: 24,
    overflow: "visible",
  },

  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.primary,
  },

  tagsWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "flex-start",
    alignContent: "flex-start",
    width: "100%",
    gap: 8,
    rowGap: 8,
    columnGap: 8,
  },

  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    maxWidth: "100%",
  },

  tagPressed: {
    opacity: 0.88,
  },

  tagActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },

  tagText: {
    color: colors.primary,
    fontSize: 16,
    lineHeight: 20,
  },

  tagTextActive: {
    color: "#FFFFFF",
  },

  scroll: {
    flex: 1,
    minHeight: 0,
    backgroundColor: colors.background,
  },

  /** Шаг 4: меньше «воздуха» по горизонтали внутри колонки. */
  step4Scroll: {
    marginHorizontal: -STEP4_HORIZONTAL_BLEED,
  },

  step5Container: {
    paddingBottom: 32,
  },

  step5MainSurface: {
    flex: 1,
    minHeight: 0,
    width: "100%",
    backgroundColor: colors.background,
    paddingTop: 0,
  },

  /** Отступ между первым полем и подзаголовком «В будущем». */
  step5SecondTitle: {
    marginTop: 14,
  },

  step5InputWrap: {
    width: "100%",
    height: 180,
  },

  step5InputHost: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    position: "relative",
  },

  step5InputInner: {
    flex: 1,
    width: "100%",
    minHeight: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.primary,
    padding: 16,
    paddingTop: 16,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "500",
    color: colors.primary,
  },
});

type MultilineOverlayProps = Omit<
  TextInputProps,
  "placeholder" | "placeholderTextColor"
> & {
  placeholder: string;
  hostStyle?: ViewStyle;
};

function MultilineInputWithOverlayPlaceholder({
  placeholder,
  style,
  hostStyle,
  value,
  onFocus,
  onBlur,
  ...rest
}: MultilineOverlayProps) {
  const [focused, setFocused] = useState(false);
  const showPh = !focused && !String(value ?? "").trim();
  return (
    <View style={hostStyle ?? styles.inputHost}>
      <TextInput
        {...rest}
        value={value}
        style={[styles.inputInner, style]}
        placeholder=""
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
      />
      {showPh ? (
        <Text style={styles.overlayPlaceholder} pointerEvents="none">
          {placeholder}
        </Text>
      ) : null}
    </View>
  );
}

function PercentInputWithPlaceholder({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const [focused, setFocused] = useState(false);
  const show = !focused && !String(value).trim();
  return (
    <View
      style={[styles.percentInputHost, styles.percentInputHostCompact]}
    >
      <TextInput
        style={[styles.percentInput, styles.percentInputCompact]}
        placeholder=""
        keyboardType="numeric"
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {show ? (
        <View style={styles.percentPlaceholderWrap} pointerEvents="none">
          <Text style={styles.percentPlaceholderText}>%</Text>
        </View>
      ) : null}
    </View>
  );
}

export default StepContent;
