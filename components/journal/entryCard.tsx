import { StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants/colors";

type Props = {
  emotion: string;
  text: string;
  date: string;
};

export default function EntryCard({ emotion, text, date }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.emotion}>{emotion}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>

      <Text style={styles.text}>{text}</Text>
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
});
