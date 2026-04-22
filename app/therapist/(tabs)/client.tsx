import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../constants/colors";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type TherapistClientLink = {
  id: string;
  alexithymicId: string;
};

type DiaryEntry = {
  id: string;
  emotion?: string | null;
  createdAt?: string;
};

export default function TherapistClientOverviewScreen() {
  const [clientCode, setClientCode] = useState("EMT-----");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const links = await apiRequest<TherapistClientLink[]>("/therapist-clients", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const first = links.find((l) => Boolean(l.alexithymicId));
      if (!first) {
        setEntries([]);
        return;
      }
      setClientCode(`EMT-${first.alexithymicId.slice(0, 4).toUpperCase()}-${first.alexithymicId.slice(4, 7).toUpperCase()}`);
      const report = await apiRequest<DiaryEntry[]>(`/therapist-clients/${first.id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(report);
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const totalEntries = entries.length;
  const dayStreak = useMemo(() => {
    if (entries.length === 0) return 0;
    const uniqueDays = new Set(
      entries
        .map((e) => (e.createdAt ? new Date(e.createdAt).toDateString() : null))
        .filter(Boolean)
    );
    return uniqueDays.size;
  }, [entries]);

  const intensity = Math.min(100, 35 + totalEntries * 2);
  const improvement = Math.max(0, 12 + Math.floor(dayStreak / 2));

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.clientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{clientCode.slice(4, 6)}</Text>
        </View>
        <View>
          <Text style={styles.clientCode}>{clientCode}</Text>
          <Text style={styles.subtle}>Last entry 2 days ago</Text>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Overview</Text>
        <View style={styles.grid}>
          <View style={styles.gridItem}>
            <Text style={styles.metricBlue}>{totalEntries}</Text>
            <Text style={styles.metricLabel}>Total entries</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricBlue}>{dayStreak}</Text>
            <Text style={styles.metricLabel}>Day streak</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricBlue}>{intensity}%</Text>
            <Text style={styles.metricLabel}>Avg intensity</Text>
          </View>
          <View style={styles.gridItem}>
            <Text style={styles.metricGreen}>↗ {improvement}%</Text>
            <Text style={styles.metricLabel}>Improvement</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>7-Day Emotion Trend</Text>
        <View style={styles.chartArea}>
          <View style={styles.lineYellow} />
          <View style={styles.lineBlue} />
          <Text style={styles.axisLabel}>Apr 5     Apr 7     Apr 9     Apr 11</Text>
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#4F75EA" }]} />
            <Text style={styles.legendText}>Anxiety</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: "#EACB57" }]} />
            <Text style={styles.legendText}>Calm</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#CBD4E7",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 20,
    paddingBottom: 24,
    gap: 10,
  },
  clientHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5C7EEB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
  },
  clientCode: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
  subtle: {
    color: "#7D8DB5",
    fontSize: 11,
  },
  card: {
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
  },
  cardTitle: {
    color: "#2E4B89",
    fontWeight: "700",
    marginBottom: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 12,
  },
  gridItem: {
    width: "50%",
  },
  metricBlue: {
    color: "#4F75EA",
    fontSize: 28 / 2,
    fontWeight: "700",
  },
  metricGreen: {
    color: "#0EA54F",
    fontSize: 28 / 2,
    fontWeight: "700",
  },
  metricLabel: {
    color: "#7D8DB5",
    fontSize: 11,
  },
  chartArea: {
    height: 120,
    borderWidth: 1,
    borderColor: "#E8D7AD",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#FBF8F0",
    overflow: "hidden",
    justifyContent: "center",
  },
  lineYellow: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 28,
    height: 2,
    backgroundColor: "#EACB57",
    transform: [{ rotate: "-8deg" }],
  },
  lineBlue: {
    position: "absolute",
    left: 8,
    right: 8,
    top: 72,
    height: 2,
    backgroundColor: "#4F75EA",
    transform: [{ rotate: "7deg" }],
  },
  axisLabel: {
    position: "absolute",
    bottom: 6,
    left: 8,
    color: "#9CA6C7",
    fontSize: 10,
  },
  legend: {
    flexDirection: "row",
    gap: 18,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: "#7D8DB5",
    fontSize: 11,
  },
});
