import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  step: number;
};

type Item = {
  text: string;
  percent: string;
};

export default function StepContent({ step }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  const [items, setItems] = useState<Item[]>([{ text: "", percent: "100" }]);

  const addItem = () => {
    setItems((prev) => [...prev, { text: "", percent: "100" }]);
  };

  const updateItem = (index: number, field: keyof Item, value: string) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);

      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }

      return next;
    });
  };

  const tagCategories = [
    {
      title: "Работа и учёба",
      tags: [
        "Работа",
        "Учёба",
        "Важный разговор",
        "Дедлайн",
        "Совещание",
        "Экзамен",
      ],
    },
    {
      title: "Эмоции",
      tags: ["Стресс", "Тревога", "Усталость", "Выгорание"],
    },
  ];

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Опиши ситуацию</Text>

        {/* AI кнопка (пока просто текст) */}
        <Text style={styles.ai}>Помощь Эми</Text>

        <TextInput
          style={styles.input}
          placeholder="Введите описание ситуации..."
          multiline
        />
      </View>
    );
  }

  if (step === 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какая мысль возникла?</Text>

        {/* AI кнопка (пока просто текст) */}
        <Text style={styles.ai}>Помощь Эми</Text>

        <TextInput
          style={styles.input}
          placeholder="Опиши свои мысли"
          multiline
        />
      </View>
    );
  }

  if (step === 3) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Что происходит в теле?</Text>

        {/* AI кнопка (пока просто текст) */}
        <Text style={styles.ai}>Помощь Эми</Text>

        <TextInput
          style={styles.input}
          placeholder="Опиши физические ощущения"
          multiline
        />
      </View>
    );
  }

  if (step === 4) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какие эмоции ты испытываешь?</Text>

        <Text style={styles.ai}>Помощь Эми</Text>

        {items.map((item, index) => (
          <View key={index} style={styles.row}>
            {/* слово */}
            <TextInput
              style={styles.smallInput}
              placeholder="эмоция"
              value={item.text}
              onChangeText={(text) => updateItem(index, "text", text)}
            />

            {/* процент */}
            <TextInput
              style={styles.percentInput}
              placeholder="100"
              keyboardType="numeric"
              value={item.percent}
              onChangeText={(text) => updateItem(index, "percent", text)}
            />

            {/* 🔥 КНОПКА УДАЛЕНИЯ */}
            <Text onPress={() => removeItem(index)} style={styles.deleteBtn}>
              У
            </Text>
          </View>
        ))}

        <TouchableOpacity onPress={addItem} style={styles.addBtn}>
          <Text style={styles.addText}>+ Добавить</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 5) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Какие действия ты сделал(а)?</Text>

        {/* AI кнопка (пока просто текст) */}
        <Text style={styles.ai}>Помощь Эми</Text>

        <TextInput
          style={styles.input}
          placeholder="Опиши, что ты сделал(а)..."
          multiline
        />

        <Text style={styles.title}>
          Что хотел(а) бы сделать в следующей ситуации?
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Как бы ты хотел(а) поступить в следующий раз?"
          multiline
        />
      </View>
    );
  }

  if (step === 6) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Выбери теги</Text>

        <Text style={styles.ai}>Помощь Эми</Text>

        {tagCategories.map((category, i) => (
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

  ai: {
    alignSelf: "flex-end",
    marginBottom: 10,
    color: colors.primary,
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
    gap: 10,
    marginBottom: 10,
  },

  smallInput: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 10,
  },

  percentInput: {
    width: 70,
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
    marginLeft: 8,
    color: "red",
    fontWeight: "700",
    fontSize: 16,
    paddingHorizontal: 6,
    paddingVertical: 2,
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
});
