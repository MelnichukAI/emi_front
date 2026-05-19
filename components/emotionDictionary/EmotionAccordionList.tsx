import { colors } from "@/constants/colors";
import { emotions, type Emotion } from "@/data/emotions";
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type DetailRow = { label: string; value: string };

function formatScalar(value: number | null): string {
  if (value === null || value === undefined) return "—";
  return String(value);
}

function joinBaseParts(emotion: string, type: string): string {
  const parts = [emotion, type].map((s) => s.trim()).filter(Boolean);
  return parts.join(parts.length === 2 ? " · " : "").trim();
}

/** Поля из `Emotion` в порядке отображения (как в справочнике / CSV). */
function buildEmotionDetailRows(e: Emotion): DetailRow[] {
  const rows: DetailRow[] = [];

  rows.push(
<<<<<<< HEAD
    {
      label: "Определение",
      value: e.definition.trim() || "—",
    }
=======
    { label: "Энергия", value: formatScalar(e.energy) },
    { label: "Валентность", value: formatScalar(e.valence) },
    { label: "Тип", value: e.category.trim() || "—" },
    { label: "Полярность", value: e.polarity.trim() || "—" },
>>>>>>> c283130373263079f0ca41e69d3e439ca6f26e09
  );

const base1 = joinBaseParts(
  e.baseEmotion1,
  e.baseType1,
);

const base2 = joinBaseParts(
  e.baseEmotion2,
  e.baseType2,
);

const baseEmotions = [
  base1,
  base2,
]
  .filter(Boolean)
  .join(", ");

if (baseEmotions) {
  rows.push({
    label: "Базовая эмоция",
    value: baseEmotions,
  });
}

rows.push(
  {
    label: "Энергия",
    value: `${formatScalar(e.energy)} / 5`,
  },

  {
    label: "Валентность",
    value: `${formatScalar(e.valence)} / 5`,
  },

  {
    label: "Оценка",
    value:
      e.polarity.trim() || "—",
  },

  {
    label: "Телесная реакция",
    value: e.bodyReaction.trim() || "—",
  },

  {
    label: "Тип",
    value:
      e.category.trim() || "—",
  },
);


  const similars = [e.similar1, e.similar2, e.similar3]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  if (similars) {
    rows.push({ label: "Похожие эмоции", value: similars });
  }



  const dictionaryLevel =
  e.level === 1
    ? "Базовый"
    : e.level === 2
      ? "Средний"
      : "Расширенный";

rows.push({
  label: "Словарь",
  value: dictionaryLevel,
});

  return rows;
}

function EmotionExpandedBody({ emotion }: { emotion: Emotion }) {
  const detailRows = useMemo(() => buildEmotionDetailRows(emotion), [emotion]);

  return (
    <View style={styles.body}>
      {detailRows.map((row) => (
        <View key={row.label} style={styles.detailField}>
          <Text style={styles.detailLabel}>{row.label}</Text>
          <Text style={styles.detailValue}>{row.value}</Text>
        </View>
      ))}
    </View>
  );
}

type RowProps = {
  emotion: Emotion;
  expanded: boolean;
  onToggle: () => void;
};

function EmotionAccordionRow({ emotion, expanded, onToggle }: RowProps) {
  return (
    <View style={styles.card}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [styles.header, pressed && styles.headerPressed]}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={`${emotion.name}. ${expanded ? "Свернуть" : "Развернуть"}`}
      >
        <Text style={styles.name} numberOfLines={2}>
          {emotion.name}
        </Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color={colors.text}
        />
      </Pressable>
      {expanded ? <EmotionExpandedBody emotion={emotion} /> : null}
    </View>
  );
}

type Props = {
  /** По умолчанию — полный список из `data/emotions`. */
  items?: Emotion[];
};

export default function EmotionAccordionList({ items = emotions }: Props) {
  const [expandedNames, setExpandedNames] = useState<Set<string>>(() => new Set());

  const toggle = useCallback((name: string) => {
    setExpandedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  return (
    <View style={styles.list}>
      {items.map((emotion) => (
        <EmotionAccordionRow
          key={emotion.name}
          emotion={emotion}
          expanded={expandedNames.has(emotion.name)}
          onToggle={() => toggle(emotion.name)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerPressed: {
    opacity: 0.92,
  },
  name: {
    flex: 1,
    fontSize: 18,
    lineHeight: 30,
    fontWeight: "600",
    color: colors.text,
  },
  body: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(75, 69, 150, 0.1)",
    gap: 14,
  },
  detailField: {
    gap: 4,
  },
  detailLabel: {
    fontSize: 16,
    lineHeight: 28,
    fontWeight: "700",
    color: colors.text,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primary,
    lineHeight: 21,
  },
});
