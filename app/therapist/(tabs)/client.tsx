import Header from "@/components/common/header";
import AppUsageBlock from "@/components/stats/AppUsageBlock";
import EmotionDayMetricChart from "@/components/stats/EmotionDayMetricChart";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type TherapistClientLink = {
  id: string;
  alexithymicId: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
  clientName?: string | null;
  clientEmail?: string | null;
};

/** Ответ GET /therapist-clients/:id/emotion-statistics */
type EmotionStatEntry = {
  id: string;
  date?: string;
  createdAt?: string | null;
  visibility?: string | null;
  emotion?: string | null;
  emotions?: Array<{
    emotion?: { id?: string; name?: string | null } | null;
  }> | null;
};

type StatRow = { label: string; count: number };

function toTopRows(counter: Map<string, number>, top = 5): StatRow[] {
  return [...counter.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({ label, count }));
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

/** Имена эмоций из picks справочника или из строкового поля emotion. */
function namesFromStatEntry(entry: EmotionStatEntry): string[] {
  const picks = (entry.emotions ?? [])
    .map((row) => row.emotion?.name?.trim())
    .filter((n): n is string => Boolean(n));
  if (picks.length > 0) return picks;
  return extractEmotionNames(entry.emotion ?? null);
}

function emotionStringForChart(entry: EmotionStatEntry): string | null {
  const names = namesFromStatEntry(entry);
  if (names.length === 0) return null;
  return names.join(", ");
}

export default function TherapistClientOverviewScreen() {
  const [statEntries, setStatEntries] = useState<EmotionStatEntry[]>([]);
  const [activeClientCount, setActiveClientCount] = useState(0);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const links = await apiRequest<TherapistClientLink[]>("/client-therapist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activeLinks = (Array.isArray(links) ? links : []).filter(
        (l) => l.status === "ACTIVE" && Boolean(l.id),
      );
      setActiveClientCount(activeLinks.length);

      if (activeLinks.length === 0) {
        setStatEntries([]);
        return;
      }

      const batches = await Promise.all(
        activeLinks.map((link) =>
          apiRequest<EmotionStatEntry[]>(
            `/therapist-clients/${link.id}/emotion-statistics`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ).catch(() => [] as EmotionStatEntry[]),
        ),
      );
      const merged = batches.flat().filter(Boolean);
      setStatEntries(merged);
    } catch {
      setStatEntries([]);
      setActiveClientCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const chartEntries = useMemo(
    () =>
      statEntries.map((e) => ({
        emotion: emotionStringForChart(e),
        createdAt: e.createdAt ?? null,
      })),
    [statEntries],
  );

  const lastEntryLabel = useMemo(() => {
    if (statEntries.length === 0) return "Пока нет записей в статистике";
    const latest = statEntries
      .map((e) => (e.createdAt ? new Date(e.createdAt) : null))
      .filter((d): d is Date => Boolean(d && !Number.isNaN(d.getTime())))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!latest) return "Пока нет записей в статистике";
    return `Самая свежая запись в выборке: ${latest.toLocaleDateString("ru-RU")}`;
  }, [statEntries]);

  const emotionRows = useMemo(() => {
    const counter = new Map<string, number>();
    statEntries.forEach((entry) => {
      namesFromStatEntry(entry).forEach((name) => {
        counter.set(name, (counter.get(name) ?? 0) + 1);
      });
    });
    return toTopRows(counter, 5);
  }, [statEntries]);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Все активные клиенты</Text>
        <Text style={styles.summaryLine}>
          Клиентов в статистике:{" "}
          <Text style={styles.summaryStrong}>{activeClientCount}</Text>
        </Text>
        <Text style={styles.summaryLine}>
          Записей дневника (объединённо):{" "}
          <Text style={styles.summaryStrong}>{statEntries.length}</Text>
        </Text>
        <Text style={styles.subtle}>{lastEntryLabel}</Text>
      </View>

      <Header
        title="Статистика"
      />

      <EmotionDayMetricChart entries={chartEntries} metric="valence" />
      <EmotionDayMetricChart entries={chartEntries} metric="energy" />

      <RankedBarBlock
        title="Топ эмоций"
        subtitle="По всем клиентам: имена из справочника (emotions) и поле emotion"
        rows={emotionRows}
      />

      <AppUsageBlock
        totalEntries={statEntries.length}
        subtitle="Число записей, попавших в объединённую выборку emotion-statistics"
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  summaryCard: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 14,
    borderRadius: 16,
    backgroundColor: colors.card,
    gap: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  summaryLine: {
    fontSize: 14,
    color: colors.subtext,
  },
  summaryStrong: {
    fontWeight: "700",
    color: colors.primary,
  },
  subtle: {
    marginTop: 6,
    fontSize: 12,
    color: colors.subtext,
  },
});
