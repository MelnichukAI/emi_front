import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth-session";
import { screenTopPadding } from "../../../lib/screen-top-padding";

type TherapistClientLink = {
  id: string;
  therapistId: string;
  alexithymicId: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
  startDate: string;
  clientName?: string | null;
  clientEmail?: string | null;
};

const STATUS_LABEL: Record<TherapistClientLink["status"], string> = {
  ACTIVE: "Активен",
  PAUSED: "Пауза",
  FINISHED: "Завершен",
};

type DiaryEntry = {
  id: string;
  createdAt?: string;
  thought?: string | null;
  situation?: string | null;
};

export default function TherapistDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [todayEntries, setTodayEntries] = useState(0);
  const [inactiveClients, setInactiveClients] = useState(0);
  const [newEntries, setNewEntries] = useState<
    Array<{ id: string; clientName: string; text: string; date: string }>
  >([]);
  const [showNewEntries, setShowNewEntries] = useState(false);
  const [links, setLinks] = useState<TherapistClientLink[]>([]);

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const fetchedLinks = await apiRequest<TherapistClientLink[]>(
        "/client-therapist",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      setLinks(fetchedLinks.filter((item) => Boolean(item.alexithymicId)));

      const therapistLinks = fetchedLinks.filter((l) => l.therapistId);
      const pausedOrFinished = therapistLinks.filter(
        (l) => l.status === "PAUSED" || l.status === "FINISHED",
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
            .catch(() => ({ link: l, entries: [] as DiaryEntry[] })),
        ),
      );

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const flatEntries = reports.flatMap(({ link, entries }) =>
        entries.map((entry) => ({ link, entry })),
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
            new Date(a.entry.createdAt ?? 0).getTime(),
        )
        .slice(0, 10)
        .map(({ link, entry }) => ({
          id: entry.id,
          clientName: link.clientName?.trim() || "Клиент",
          text:
            entry.thought?.trim() || entry.situation?.trim() || "Без текста",
          date: new Date(entry.createdAt ?? 0).toLocaleDateString("ru-RU"),
        }));
      setNewEntries(mappedNewEntries);
    } catch {
      setNewEntries([]);
      setLinks([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const inactiveText = useMemo(() => {
    if (inactiveClients === 0) return "Нет неактивных клиентов";
    if (inactiveClients === 1) return "1 неактивный клиент";
    return `${inactiveClients} неактивных клиента`;
  }, [inactiveClients]);

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: screenTopPadding(insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Дашборд</Text>
        <Text style={styles.subtitle}>Обзор активности клиентов</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Сводка активности</Text>
          <View style={styles.row}>
            <Text style={styles.metricIcon}>📝</Text>
            <View>
              <Text style={styles.metricLabel}>Новых записей сегодня</Text>
              <Text style={styles.metricValue}>{todayEntries}</Text>
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
            style={({ pressed }) => [
              styles.wideButton,
              pressed && styles.pressed,
            ]}
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

        <Text style={styles.sectionTitle}>Клиенты</Text>
        <Text style={styles.sectionSubtitle}>Подключенные клиенты</Text>

        {links.map((link) => (
          <View key={link.id} style={styles.clientCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(link.clientName?.trim().slice(0, 2) || "КЛ").toUpperCase()}
              </Text>
            </View>
            <View style={styles.clientCardBody}>
              <Text style={styles.clientName}>
                {link.clientName?.trim() || "Клиент"}
              </Text>
              <Text style={styles.clientMeta}>
                {link.clientEmail || "Email не указан"}
              </Text>
              <Text style={styles.clientMeta}>
                Статус: {STATUS_LABEL[link.status]}
              </Text>
              <Text style={styles.clientMeta}>
                Начало:{" "}
                {new Date(link.startDate).toLocaleDateString("ru-RU")}
              </Text>
            </View>
          </View>
        ))}

        {links.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              Пока нет привязанных клиентов.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
