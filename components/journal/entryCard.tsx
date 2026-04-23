import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  emotion: string;
  text: string;
  date: string;
  /** Без горизонтальных отступов — для встроенных списков (профиль и т.п.) */
  noOuterMargin?: boolean;
  /** Компактная карточка для сетки «плитками» */
  compact?: boolean;
};

export default function EntryCard({
  emotion,
  text,
  date,
  noOuterMargin,
  compact,
}: Props) {
  return (
    <View
      style={[
        styles.card,
        noOuterMargin && styles.cardNoOuterMargin,
        compact && styles.cardCompact,
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.emotion, compact && styles.emotionCompact]}>
          {emotion}
        </Text>
        <Text style={[styles.date, compact && styles.dateCompact]}>{date}</Text>
      </View>

      <Text
        style={[styles.text, compact && styles.textCompact]}
        numberOfLines={compact ? 4 : undefined}
      >
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 20,
    marginTop: 10,
  },
  cardNoOuterMargin: {
    marginHorizontal: 0,
    marginTop: 0,
  },
  cardCompact: {
    padding: 10,
    marginTop: 0,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  emotion: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
  date: {
    fontSize: 12,
    color: colors.subtext,
  },
  text: {
    fontSize: 14,
    color: colors.text,
  },
  emotionCompact: {
    fontSize: 14,
  },
  dateCompact: {
    fontSize: 11,
  },
  textCompact: {
    fontSize: 12,
    lineHeight: 16,
  },
});
