import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  totalEntries: number;
  avgEntriesPerWeek: number | null;
};

function formatAvgPerWeek(value: number | null): string {
  if (value == null) return "—";
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function AppUsageBlock({
  totalEntries,
  avgEntriesPerWeek,
}: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Активность в приложении</Text>

      <View style={styles.metricsRow}>
        <View style={styles.metricCol}>
          <Text style={styles.metricValue}>{totalEntries}</Text>
          <Text style={styles.metricLabel}>Всего записей</Text>
        </View>
        <View style={styles.metricCol}>
          <Text style={styles.metricValue}>
            {formatAvgPerWeek(avgEntriesPerWeek)}
          </Text>
          <Text style={styles.metricLabel}>В среднем за неделю</Text>
        </View>
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
    borderWidth: 1,
    borderColor: "rgba(89, 77, 157, 0.22)",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  metricsRow: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "stretch",
  },
  metricCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
  },
  metricValue: {
    fontSize: 36,
    fontWeight: "700",
    color: colors.primary,
    lineHeight: 42,
  },
  metricLabel: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "500",
    color: colors.subtext,
    textAlign: "center",
  },
});
