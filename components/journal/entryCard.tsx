import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  emotion: string;
  text: string;
  date: string;
  onHide?: () => void;
  /** Без горизонтальных отступов — для встроенных списков (профиль и т.п.) */
  noOuterMargin?: boolean;
  /** Компактная карточка для сетки «плитками» */
  compact?: boolean;
};

export default function EntryCard({
  emotion,
  text,
  date,
  onHide,
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
        <View style={styles.headerLeft}>
          <Text style={[styles.emotion, compact && styles.emotionCompact]}>{emotion}</Text>
          <Text style={[styles.date, compact && styles.dateCompact]}>{date}</Text>
        </View>
        {onHide ? (
          <Pressable onPress={onHide} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        ) : null}
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
    alignItems: "flex-start",
    marginBottom: 6,
  },
  headerLeft: {
    flex: 1,
    paddingRight: 8,
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
    marginTop: 2,
  },
  closeButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#E05A5A",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 18,
    fontWeight: "700",
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
