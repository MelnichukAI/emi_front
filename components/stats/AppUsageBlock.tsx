import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  totalEntries: number;
  subtitle?: string;
};

export default function AppUsageBlock({
  totalEntries,
  subtitle = "Пока только общее число записей; позже добавим детали.",
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>App usage</Text>
      <Text style={styles.hint}>{subtitle}</Text>

      <View style={styles.metricWrap}>
        <Text style={styles.metric}>{totalEntries}</Text>
        <Text style={styles.metricLabel}>записей в дневнике</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    marginHorizontal: 16,
    marginBottom: 24,
    padding: 20,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  hint: {
    marginTop: 6,
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
  },
  metricWrap: {
    marginTop: 20,
    alignItems: "center",
    paddingVertical: 8,
  },
  metric: {
    fontSize: 44,
    fontWeight: "700",
    color: colors.primary,
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 15,
    color: colors.subtext,
  },
});
