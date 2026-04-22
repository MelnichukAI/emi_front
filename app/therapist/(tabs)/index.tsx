import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../constants/colors";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type TherapistCodeResponse = {
  code: string;
  fullName?: string | null;
};

type TherapistClientLink = {
  id: string;
  therapistId: string;
  alexithymicId: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
};

type DiaryEntry = {
  id: string;
  createdAt?: string;
};

export default function TherapistDashboardScreen() {
  const [code, setCode] = useState("...");
  const [todayEntries, setTodayEntries] = useState(0);
  const [inactiveClients, setInactiveClients] = useState(0);

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const [codeData, links] = await Promise.all([
        apiRequest<TherapistCodeResponse>("/therapists/me/code", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<TherapistClientLink[]>("/therapist-clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setCode(codeData.code);

      const therapistLinks = links.filter((l) => l.therapistId);
      const pausedOrFinished = therapistLinks.filter(
        (l) => l.status === "PAUSED" || l.status === "FINISHED"
      ).length;
      setInactiveClients(pausedOrFinished);

      const reports = await Promise.all(
        therapistLinks.slice(0, 10).map((l) =>
          apiRequest<DiaryEntry[]>(`/therapist-clients/${l.id}/report`, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => [])
        )
      );

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const countToday = reports.flat().filter((entry) => {
        if (!entry.createdAt) return false;
        const d = new Date(entry.createdAt);
        return !Number.isNaN(d.getTime()) && d >= startOfToday;
      }).length;
      setTodayEntries(countToday);
    } catch {
      // keep defaults
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const inactiveText = useMemo(() => {
    if (inactiveClients === 0) return "No inactive clients";
    if (inactiveClients === 1) return "1 client inactive";
    return `${inactiveClients} clients inactive`;
  }, [inactiveClients]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Overview of client activity</Text>

      <Text style={styles.sectionLabel}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <Pressable style={[styles.actionCard, styles.actionPrimary]}>
          <Text style={styles.actionIcon}>☼</Text>
          <Text style={styles.actionPrimaryText}>Add Client</Text>
        </Pressable>
        <Pressable style={styles.actionCard}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Share Code</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Activity Summary</Text>
        <View style={styles.row}>
          <Text style={styles.metricIcon}>📝</Text>
          <View>
            <Text style={styles.metricLabel}>New Entries Today</Text>
            <Text style={styles.metricValueBlue}>{todayEntries}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.metricIcon}>⏺</Text>
          <View>
            <Text style={styles.metricLabel}>Inactive Clients</Text>
            <Text style={styles.metricSub}>{inactiveText}</Text>
          </View>
        </View>
        <Pressable style={styles.wideButton}>
          <Text style={styles.wideButtonText}>View New Entries</Text>
        </Pressable>
      </View>

      <View style={styles.codeHint}>
        <Text style={styles.codeHintLabel}>Your professional code</Text>
        <Text style={styles.codeHintValue}>{code}</Text>
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
    paddingTop: 28,
    paddingBottom: 24,
    gap: 12,
  },
  title: {
    fontSize: 32 / 2,
    color: "#2E4B89",
    fontWeight: "700",
  },
  subtitle: {
    marginTop: -2,
    color: "#7D8DB5",
    fontSize: 22 / 2,
  },
  sectionLabel: {
    marginTop: 8,
    color: "#7D8DB5",
    fontSize: 22 / 2,
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F5F1E8",
    padding: 12,
    gap: 8,
  },
  actionPrimary: {
    backgroundColor: "#5C7EEB",
  },
  actionIcon: {
    fontSize: 18,
    color: "#2E4B89",
  },
  actionText: {
    color: "#2E4B89",
    fontWeight: "600",
  },
  actionPrimaryText: {
    color: "white",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
    gap: 10,
  },
  cardTitle: {
    color: "#2E4B89",
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  metricIcon: {
    fontSize: 16,
  },
  metricLabel: {
    color: "#2E4B89",
    fontWeight: "600",
  },
  metricValueBlue: {
    color: "#4F75EA",
    fontWeight: "700",
    fontSize: 18,
  },
  metricSub: {
    color: "#7D8DB5",
    fontSize: 12,
  },
  wideButton: {
    marginTop: 4,
    backgroundColor: "#E4E8F4",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  wideButtonText: {
    color: "#5C7EEB",
    fontWeight: "600",
  },
  codeHint: {
    marginTop: 4,
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
  },
  codeHintLabel: {
    color: "#7D8DB5",
    fontSize: 12,
    marginBottom: 4,
  },
  codeHintValue: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 16,
  },
});
