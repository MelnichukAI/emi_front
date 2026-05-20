import Header from "@/components/common/header";
import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { apiRequest } from "../../../lib/api";
import { getAccessToken } from "../../../lib/auth-session";

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

type UserMeResponse = {
  email?: string | null;
  therapistProfile?: {
    fullName?: string | null;
  } | null;
};

type DiaryEntry = {
  id: string;
  createdAt?: string;
  date?: string | null;
  emotion?: string | null;
  thought?: string | null;
  situation?: string | null;
};

type DashboardNewEntry = {
  id: string;
  clientName: string;
  emotions: string;
  text: string;
  date: string;
};

function entryTimeMs(entry: DiaryEntry): number | null {
  const raw = entry.createdAt ?? entry.date ?? null;
  if (!raw) return null;
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  return d.getTime();
}

function formatEntryDateShort(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

function extractEmotionNames(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => chunk.replace(/\s*\d+%?$/g, "").trim())
    .filter(Boolean);
}

function emotionsLabel(entry: DiaryEntry): string {
  const names = extractEmotionNames(entry.emotion ?? null);
  if (names.length > 0) return names.join(", ");
  const single = entry.emotion?.trim();
  return single || "Без эмоции";
}

function entryPreview(entry: DiaryEntry): string {
  return (
    entry.thought?.trim() || entry.situation?.trim() || "Запись без текста"
  );
}

function clientInitials(link: TherapistClientLink): string {
  return (link.clientName?.trim().slice(0, 2) || "КЛ").toUpperCase();
}

function TherapistClientCard({
  link,
  inverted,
}: {
  link: TherapistClientLink;
  inverted?: boolean;
}) {
  return (
    <View
      style={[styles.clientCard, inverted && panelStyles.clientCardInactive]}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{clientInitials(link)}</Text>
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
          Начало: {new Date(link.startDate).toLocaleDateString("ru-RU")}
        </Text>
      </View>
    </View>
  );
}

function CollapsedListPlaceholder({
  message,
  onPress,
  accessibilityLabel,
}: {
  message: string;
  onPress: () => void;
  accessibilityLabel: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) =>
        pressed ? panelStyles.collapsedCardPressed : undefined
      }
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <View style={panelStyles.collapsedCard}>
        <Text style={panelStyles.collapsedCardText}>{message}</Text>
      </View>
    </Pressable>
  );
}

export default function TherapistDashboardScreen() {
  const [userName, setUserName] = useState("Пользователь");
  const [todayEntries, setTodayEntries] = useState(0);
  const [newEntries, setNewEntries] = useState<DashboardNewEntry[]>([]);
  const [newEntriesExpanded, setNewEntriesExpanded] = useState(true);
  const [clientsExpanded, setClientsExpanded] = useState(true);
  const [links, setLinks] = useState<TherapistClientLink[]>([]);

  const loadData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const [fetchedLinks, me] = await Promise.all([
        apiRequest<TherapistClientLink[]>("/client-therapist", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<UserMeResponse>("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const nameFromProfile = me.therapistProfile?.fullName?.trim();
      const nameFromEmail = me.email?.split("@")[0]?.trim();
      setUserName(nameFromProfile || nameFromEmail || "Пользователь");

      setLinks(fetchedLinks.filter((item) => Boolean(item.alexithymicId)));

      const activeClientLinks = fetchedLinks.filter(
        (l) => l.status === "ACTIVE" && Boolean(l.alexithymicId),
      );

      const reports = await Promise.all(
        activeClientLinks.map((l) =>
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

      const todayFlatEntries = flatEntries.filter(({ entry }) => {
        const t = entryTimeMs(entry);
        return t !== null && t >= startOfToday.getTime();
      });
      setTodayEntries(todayFlatEntries.length);

      const mappedNewEntries = todayFlatEntries
        .sort(
          (a, b) =>
            (entryTimeMs(b.entry) ?? 0) - (entryTimeMs(a.entry) ?? 0),
        )
        .map(({ link, entry }) => {
          const clientName = link.clientName?.trim() || "Клиент";
          return {
            id: entry.id,
            clientName,
            emotions: emotionsLabel(entry),
            text: entryPreview(entry),
            date: formatEntryDateShort(entry.createdAt ?? entry.date),
          };
        });
      setNewEntries(mappedNewEntries);
    } catch {
      setUserName("Пользователь");
      setNewEntries([]);
      setLinks([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  const activeLinks = useMemo(
    () => links.filter((link) => link.status === "ACTIVE"),
    [links],
  );
  const inactiveLinks = useMemo(
    () =>
      links.filter(
        (link) => link.status === "PAUSED" || link.status === "FINISHED",
      ),
    [links],
  );

  const greetingName = userName.trim() || "Пользователь";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content, styles.contentWithHeader]}
        showsVerticalScrollIndicator={false}
      >
        <Header
          title={`С возвращением, ${greetingName}`}
          subtitle="Обзор активности клиентов"
          titleColor={colors.text}
          subtitleColor={colors.textThird}
          titleFontSize={24}
          titleFontWeight="600"
          subtitleMarginTop={14}
          containerPaddingBottom={0}
        />

        <View style={panelStyles.dashboardSections}>
          <View
            style={[
              panelStyles.entriesPanel,
              newEntriesExpanded &&
                newEntries.length > 1 &&
                panelStyles.entriesPanelExpanded,
            ]}
          >
          <Pressable
            onPress={() => setNewEntriesExpanded((v) => !v)}
            style={panelStyles.entriesToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded: newEntriesExpanded }}
            accessibilityLabel={
              newEntriesExpanded
                ? "Скрыть новые записи клиентов"
                : "Показать новые записи клиентов"
            }
          >
            <View style={panelStyles.entriesToggleRow}>
              <View style={panelStyles.entriesToggleTextBlock}>
                <Text style={panelStyles.entriesToggleTitle}>
                  Новые записи - {" "}
                  <Text style={panelStyles.entriesToggleCount}>
                    {todayEntries}
                  </Text>
                </Text>
                <Text style={panelStyles.entriesToggleHint}>
                  (За текущее число)
                </Text>
              </View>
              <Ionicons
                name={newEntriesExpanded ? "chevron-down" : "chevron-forward"}
                size={22}
                color={colors.text}
              />
            </View>
          </Pressable>

          <View style={panelStyles.entriesInner}>
            <View style={panelStyles.entriesList}>
              {newEntriesExpanded ? (
                newEntries.map((item) => (
                  <EntryCard
                    key={item.id}
                    emotion={item.clientName}
                    headerSubtitle={item.emotions}
                    text={item.text}
                    date={item.date}
                    noOuterMargin
                    bodyLines={4}
                    bodyColor={colors.textThird}
                  />
                ))
              ) : (
                <CollapsedListPlaceholder
                  message={`Список записей скрыт.\nНажмите, чтобы развернуть`}
                  onPress={() => setNewEntriesExpanded(true)}
                  accessibilityLabel="Развернуть список записей"
                />
              )}
            </View>
            {newEntriesExpanded && newEntries.length === 0 ? (
              <Text style={panelStyles.emptyHint}>
                Пока нет новых записей за сегодня.
              </Text>
            ) : null}
            {newEntriesExpanded && newEntries.length === 1 ? (
              <Text style={panelStyles.emptyHint}>
                Пока нет других записей за сегодня.
              </Text>
            ) : null}
          </View>
          </View>

          <View
            style={[
              panelStyles.entriesPanel,
              clientsExpanded &&
                links.length > 1 &&
                panelStyles.entriesPanelExpanded,
            ]}
          >
          <Pressable
            onPress={() => setClientsExpanded((v) => !v)}
            style={panelStyles.entriesToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded: clientsExpanded }}
            accessibilityLabel={
              clientsExpanded ? "Скрыть клиентов" : "Показать клиентов"
            }
          >
            <View style={panelStyles.entriesToggleRow}>
              <View style={panelStyles.entriesToggleTextBlock}>
                <Text style={panelStyles.entriesToggleTitle}>Клиенты</Text>
                <Text style={panelStyles.clientsStatLine}>
                  Активных клиентов -{" "}
                  <Text style={panelStyles.clientsStatCount}>
                    {activeLinks.length}
                  </Text>
                </Text>
                <Text style={panelStyles.clientsStatLine}>
                  Неактивных клиентов -{" "}
                  <Text style={panelStyles.clientsStatCount}>
                    {inactiveLinks.length}
                  </Text>
                </Text>
              </View>
              <Ionicons
                name={clientsExpanded ? "chevron-down" : "chevron-forward"}
                size={22}
                color={colors.text}
              />
            </View>
          </Pressable>

          <View style={panelStyles.entriesInner}>
            <View style={panelStyles.entriesList}>
              {clientsExpanded ? (
                <>
                  {activeLinks.map((link) => (
                    <TherapistClientCard key={link.id} link={link} />
                  ))}
                  {inactiveLinks.map((link) => (
                    <TherapistClientCard key={link.id} link={link} inverted />
                  ))}
                </>
              ) : (
                <CollapsedListPlaceholder
                  message={`Список клиентов скрыт.\nНажмите, чтобы развернуть`}
                  onPress={() => setClientsExpanded(true)}
                  accessibilityLabel="Развернуть список клиентов"
                />
              )}
            </View>
            {clientsExpanded && links.length === 0 ? (
              <Text style={panelStyles.emptyHint}>
                Пока нет привязанных клиентов.
              </Text>
            ) : null}
          </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const panelStyles = StyleSheet.create({
  dashboardSections: {
    gap: 28,
    marginTop: 12,
  },
  entriesPanel: {
    backgroundColor: colors.entryCard,
    borderRadius: 30,
    paddingBottom: 28,
    minHeight: 100,
  },
  entriesPanelExpanded: {
    minHeight: 280,
  },
  entriesToggle: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  entriesToggleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingVertical: 4,
    gap: 8,
  },
  entriesToggleTextBlock: {
    flex: 1,
    gap: 6,
  },
  entriesToggleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  entriesToggleCount: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  entriesToggleHint: {
    fontSize: 16,
    color: colors.subtext,
    lineHeight: 22,
  },
  clientsStatLine: {
    fontSize: 16,
    color: colors.subtext,
    lineHeight: 22,
  },
  clientsStatCount: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  clientCardInactive: {
    backgroundColor: colors.background,
  },
  entriesInner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  entriesList: {
    gap: 12,
  },
  collapsedCard: {
    backgroundColor: colors.entryCard,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.12)",
  },
  collapsedCardPressed: {
    opacity: 0.92,
  },
  collapsedCardText: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textThird,
    textAlign: "center",
  },
  emptyHint: {
    marginTop: 12,
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
  },
});
