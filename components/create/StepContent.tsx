import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import ChatIcon from "@/assets/icons/chat.svg";
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
    router.navigate("/client/chat");
  };

  const addItem = () => {
    setItems((prev: Item[]) => [...prev, { text: "", percent: "100" }]);
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
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
        <Text style={styles.title}>Опиши ситуацию</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Введите описание ситуации..."
          multiline
          value={form.situation}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, situation: text }))
          }
        />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какая мысль возникла?</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Опиши свои мысли"
          multiline
          value={form.thought}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, thought: text }))
          }
        />
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Что происходит в теле?</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Опиши физические ощущения"
          multiline
          value={form.body}
          onChangeText={(text) => setForm((prev) => ({ ...prev, body: text }))}
        />
      </View>
    );
  }

  if (step === 4) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какие эмоции ты испытываешь?</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

        {/* 🔥 СКРОЛЛ ОБЛАСТЬ */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={{ paddingBottom: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {items.map((item: Item, index: number) => (
            <View key={index} style={styles.row}>
              <View style={styles.textWrapper}>
                <TextInput
                  style={styles.smallInput}
                  placeholder="эмоция"
                  value={item.text}
                  onChangeText={(text) => updateItem(index, "text", text)}
                />
              </View>

              <TextInput
                style={styles.percentInput}
                placeholder="%"
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
    );
  }

  if (step === 5) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какие действия ты сделал(а)?</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

        <TextInput
          style={styles.input}
          placeholder="Опиши, что ты сделал(а)..."
          multiline
          value={form.behavior}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, behavior: text }))
          }
        />

        <Text style={styles.title}>
          Что хотел(а) бы сделать в следующей ситуации?
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Как бы ты хотел(а) поступить в следующий раз?"
          multiline
          value={form.behaviorAlt}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, behaviorAlt: text }))
          }
        />
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Выбери теги</Text>
        <Pressable
          style={styles.chatButton}
          onPress={openChatTab}
          accessibilityRole="button"
          accessibilityLabel="Открыть чат"
        >
          <ChatIcon width={40} height={40} />
        </Pressable>

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
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 10,
    color: colors.text,
  },

  chatButton: {
    alignSelf: "flex-end",
    marginBottom: 10,
    padding: 10,
    borderRadius: 999,
    backgroundColor: colors.card,
    minWidth: 52,
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
  },

  tagScrollContainer: {
    flex: 1,
    minHeight: 0,
  },

  tagScrollContent: {
    paddingBottom: 12,
  },

  input: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
    textAlignVertical: "top",
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
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
  },

  percentInput: {
    width: 60,
    marginRight: 8,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
    textAlign: "center",
  },

  addBtn: {
    marginTop: 10,
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: 12,
    alignItems: "center",
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
    color: colors.text,
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
    backgroundColor: colors.card,
    color: colors.text,
    overflow: "hidden",
  },

  tagActive: {
    backgroundColor: colors.primary,
    color: "white",
  },

  scroll: {
    maxHeight: "70%",
  },
});
