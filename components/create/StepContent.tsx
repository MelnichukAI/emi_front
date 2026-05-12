import ChatIcon from "@/assets/icons/chat.svg";
import EmotionAutocompleteInput from "@/components/common/emotionAutocompleteInput";
import { isKnownEmotionName } from "@/data/emotions";
import {
  buildDiaryDraftChatContext,
  stashDiaryDraftContextForChat,
} from "@/lib/diary-draft-chat-bridge";
import { useRouter } from "expo-router";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";
import { DIARY_ENTRY_TAG_GROUPS } from "../../constants/diaryEntryTags";

type Item = {
  text: string;
  percent: string;
};

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

export default function StepContent({
  step,
  form,
  setForm,
  items,
  setItems,
  selectedTags,
  setSelectedTags,
}: Props) {
  const router = useRouter();

  const openChatTab = () => {
    stashDiaryDraftContextForChat(
      buildDiaryDraftChatContext({ step, form, items, selectedTags }),
    );
    router.navigate("/client/chat");
  };

  const renderTitleRow = (label: string) => (
    <View style={styles.titleRow}>
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
    const hasIncomplete = items.some(
      (item) => item.text.trim().length === 0 || item.percent.trim().length === 0,
    );
    if (hasIncomplete) {
      alert("Сначала заполните текущее поле эмоции и процента.");
      return;
    }
    const hasUnknownEmotion = items.some(
      (item) => !isKnownEmotionName(item.text),
    );
    if (hasUnknownEmotion) {
      alert("Выберите эмоцию из списка.");
      return;
    }
    setItems((prev: Item[]) => [...prev, { text: "", percent: "100" }]);
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    if (field === "text") {
      const trimmed = value.trim();
      const isDuplicate = items.some(
        (item, itemIndex) =>
          itemIndex !== index &&
          item.text.trim().toLocaleLowerCase("ru") ===
            trimmed.toLocaleLowerCase("ru") &&
          trimmed.length > 0,
      );
      if (isDuplicate) {
        alert("Эта эмоция уже выбрана в соседнем поле.");
        return;
      }
    }
    const updated: Item[] = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
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
          <TextInput
            style={styles.input}
            placeholder="Введите описание ситуации..."
            placeholderTextColor={colors.subtext}
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
          <TextInput
            style={styles.input}
            placeholder="Введите мысли, которые возникли"
            placeholderTextColor={colors.subtext}
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
          <TextInput
            style={styles.input}
            placeholder="Введите описание физических ощущений"
            placeholderTextColor={colors.subtext}
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
            style={styles.scroll}
            contentContainerStyle={{ paddingBottom: 10 }}
            showsVerticalScrollIndicator={false}
          >
            {items.map((item: Item, index: number) => (
              <View
                key={index}
                style={[
                  styles.row,
                  { zIndex: items.length - index, elevation: 1000 - index },
                ]}
              >
                <View style={styles.textWrapper}>
                  <EmotionAutocompleteInput
                    value={item.text}
                    onChangeText={(text) => updateItem(index, "text", text)}
                    inputStyle={styles.smallInput}
                    placeholder="Начните вводить"
                  />
                </View>

                <TextInput
                  style={styles.percentInput}
                  placeholder="%"
                  placeholderTextColor={colors.subtext}
                  keyboardType="numeric"
                  value={item.percent}
                  onChangeText={(text) => updateItem(index, "percent", text)}
                />

                {items.length > 1 && (
                  <Pressable onPress={() => removeItem(index)}>
                    <Text style={styles.deleteBtn}>✕</Text>
                  </Pressable>
                )}
              </View>
            ))}

            <TouchableOpacity onPress={addItem} style={styles.addBtn}>
              <Text style={styles.addText}>+ Добавить</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    );
  }

  if (step === 5) {
    return (
      <View style={styles.container}>
        {renderTitleRow("Поведение")}
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Введите, описание ваших действий"
            placeholderTextColor={colors.subtext}
            multiline
            value={form.behavior}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, behavior: text }))
            }
          />
        </View>

        <Text style={styles.title}>
          В будущем
        </Text>


        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            placeholder="Как бы вы хотели поступить в следующий раз?"
            placeholderTextColor={colors.subtext}
            multiline
            value={form.behaviorAlt}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, behaviorAlt: text }))
            }
          />
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
          >
            {DIARY_ENTRY_TAG_GROUPS.map((category, i) => (
              <View key={i} style={styles.categoryBlock}>
                <Text style={styles.categoryTitle}>{category.title}</Text>

                <View style={styles.tagsWrap}>
                  {category.tags.map((tag) => {
                    const isActive = selectedTags.has(tag);

                    return (
                      <Text
                        key={tag}
                        onPress={() => toggleTag(tag)}
                        style={[styles.tag, isActive && styles.tagActive]}
                      >
                        {tag}
                      </Text>
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
    color: colors.primary,
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
    marginBottom: 14,
  },

  titleFollowUp: {
    marginTop: 8,
  },

  inputWrap: {
    flex: 1,
    minHeight: 0,
    width: "100%",
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
  },

  tagScrollContainer: {
    flex: 1,
    minHeight: 0,
  },

  tagScrollContent: {
    paddingBottom: 12,
  },

  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    paddingTop: 16,
    minHeight: 200,
    textAlignVertical: "top",
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  textWrapper: {
    flex: 1,
    marginRight: 8,
  },

  smallInput: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },

  percentInput: {
    width: 60,
    marginRight: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    textAlign: "center",
    color: colors.text,
  },

  addBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },

  addText: {
    color: colors.primary,
    fontWeight: "600",
  },

  deleteBtn: {
    fontSize: 18,
    color: "red",
    paddingHorizontal: 6,
  },

  categoryBlock: {
    marginBottom: 20,
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
    gap: 8,
  },

  tag: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    color: colors.text,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },

  tagActive: {
    backgroundColor: colors.primary,
    color: "white",
    borderColor: colors.primary,
  },

  scroll: {
    flex: 1,
    minHeight: 0,
  },
});
