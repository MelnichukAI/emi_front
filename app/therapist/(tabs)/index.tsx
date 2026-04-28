import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
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
  clientName?: string | null;
  clientEmail?: string | null;
};

type DiaryEntry = {
  id: string;
  createdAt?: string;
  thought?: string | null;
  situation?: string | null;
};

export default function TherapistDashboardScreen() {
  const [code, setCode] = useState("...");
  const [todayEntries, setTodayEntries] = useState(0);
  const [inactiveClients, setInactiveClients] = useState(0);
  const [newEntries, setNewEntries] = useState<
    Array<{ id: string; clientName: string; text: string; date: string }>
  >([]);
  const [showNewEntries, setShowNewEntries] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const [codeData, links] = await Promise.all([
        apiRequest<TherapistCodeResponse>("/therapists/me/code", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<TherapistClientLink[]>("/client-therapist", {
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
          })
            .then((entries) => ({
              link: l,
              entries,
            }))
            .catch(() => ({ link: l, entries: [] as DiaryEntry[] }))
        )
      );

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const flatEntries = reports.flatMap(({ link, entries }) =>
        entries.map((entry) => ({ link, entry }))
      );
      const countToday = flatEntries.filter(({ entry }) => {
        if (!entry.createdAt) return false;
        const d = new Date(entry.createdAt);
        return !Number.isNaN(d.getTime()) && d >= startOfToday;
      }).length;
      setTodayEntries(countToday);

      const mappedNewEntries = flatEntries
        .filter(({ entry }) => Boolean(entry.createdAt))
        .sort(
          (a, b) =>
            new Date(b.entry.createdAt ?? 0).getTime() -
            new Date(a.entry.createdAt ?? 0).getTime()
        )
        .slice(0, 10)
        .map(({ link, entry }) => ({
          id: entry.id,
          clientName: link.clientName?.trim() || "Клиент",
          text: entry.thought?.trim() || entry.situation?.trim() || "Без текста",
          date: new Date(entry.createdAt ?? 0).toLocaleDateString("ru-RU"),
        }));
      setNewEntries(mappedNewEntries);
    } catch {
      // keep defaults
      setNewEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const inactiveText = useMemo(() => {
    if (inactiveClients === 0) return "Нет неактивных клиентов";
    if (inactiveClients === 1) return "1 неактивный клиент";
    return `${inactiveClients} неактивных клиента`;
  }, [inactiveClients]);

  const handleShareCode = useCallback(async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode || normalizedCode === "...") return;

    try {
      await Clipboard.setStringAsync(normalizedCode);
      setCopyNotice("Код скопирован");
      setTimeout(() => setCopyNotice(null), 1600);
    } catch {
      setCopyNotice("Не удалось скопировать код");
      setTimeout(() => setCopyNotice(null), 1800);
    }
  }, [code]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Дашборд</Text>
      <Text style={styles.subtitle}>Обзор активности клиентов</Text>

      <Text style={styles.sectionLabel}>Быстрые действия</Text>
      <View style={styles.quickActions}>
        <Pressable style={[styles.actionCard, styles.actionPrimary]}>
          <Text style={styles.actionIcon}>☼</Text>
          <Text style={styles.actionPrimaryText}>Добавить клиента</Text>
        </Pressable>
        <Pressable style={styles.actionCard} onPress={() => void handleShareCode()}>
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Поделиться кодом</Text>
          <Text style={styles.actionCodeValue}>{code}</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Сводка активности</Text>
        <View style={styles.row}>
          <Text style={styles.metricIcon}>📝</Text>
          <View>
            <Text style={styles.metricLabel}>Новых записей сегодня</Text>
            <Text style={styles.metricValueBlue}>{todayEntries}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.metricIcon}>⏺</Text>
          <View>
            <Text style={styles.metricLabel}>Неактивные клиенты</Text>
            <Text style={styles.metricSub}>{inactiveText}</Text>
          </View>
        </View>
        <Pressable
          style={styles.wideButton}
          onPress={() => {
            loadData();
            setShowNewEntries((prev) => !prev);
          }}
        >
          <Text style={styles.wideButtonText}>
            {showNewEntries ? "Скрыть новые записи" : "Показать новые записи"}
          </Text>
        </Pressable>
      </View>

      {showNewEntries ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Новые записи клиентов</Text>
          {newEntries.length === 0 ? (
            <Text style={styles.metricSub}>Пока нет новых записей.</Text>
          ) : (
            newEntries.map((item) => (
              <View key={item.id} style={styles.entryRow}>
                <Text style={styles.entryClient}>{item.clientName}</Text>
                <Text style={styles.entryDate}>{item.date}</Text>
                <Text style={styles.entryText}>{item.text}</Text>
              </View>
            ))
          )}
        </View>
      ) : null}

      {copyNotice ? (
        <View style={styles.noticeOverlay} pointerEvents="none">
          <Text style={styles.copyNotice}>{copyNotice}</Text>
        </View>
      ) : null}
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
  actionCodeValue: {
    color: "#2E4B89",
    fontWeight: "700",
    fontSize: 14,
    marginTop: 2,
  },
  noticeOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
    elevation: 20,
  },
  copyNotice: {
    backgroundColor: "#2E4B89",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: "600",
    overflow: "hidden",
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
  entryRow: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#D9DFEF",
  },
  entryClient: {
    color: "#2E4B89",
    fontWeight: "700",
    fontSize: 13,
  },
  entryDate: {
    color: "#7D8DB5",
    fontSize: 11,
    marginTop: 2,
  },
  entryText: {
    color: colors.text,
    fontSize: 13,
    marginTop: 4,
  },
});
