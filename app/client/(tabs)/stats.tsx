import Header from "@/components/common/header";
import AppUsageBlock from "@/components/stats/AppUsageBlock";
import EmotionDayMetricChart from "@/components/stats/EmotionDayMetricChart";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import {
  buildFeedbackEffectivenessRows,
  computeAvgEntriesPerWeek,
} from "@/lib/feedback-statistics";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet } from "react-native";

type DiaryEntryResponse = {
  id: string;
  emotion?: string | null;
  tags?: string | null;
  createdAt?: string | null;
};

type ReflectionResponse = {
  id: string;
  diaryEntryId?: string;
  stateChange?: string;
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

function extractTags(raw?: string | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((chunk) => chunk.trim())
    .filter(Boolean);
}

export default function StatsScreen() {
  const [entries, setEntries] = useState<DiaryEntryResponse[]>([]);
  const [reflections, setReflections] = useState<ReflectionResponse[]>([]);

  const loadStats = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setEntries([]);
      setReflections([]);
      return;
    }
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [diaryData, reflectionData] = await Promise.all([
        apiRequest<DiaryEntryResponse[]>("/diary?all=true", { headers }),
        apiRequest<ReflectionResponse[]>("/reflections", { headers }).catch(
          () => [] as ReflectionResponse[],
        ),
      ]);
      setEntries(Array.isArray(diaryData) ? diaryData : []);
      setReflections(Array.isArray(reflectionData) ? reflectionData : []);
    } catch {
      setEntries([]);
      setReflections([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats])
  );

  const emotionRows = useMemo(() => {
    const counter = new Map<string, number>();
    entries.forEach((entry) => {
      extractEmotionNames(entry.emotion).forEach((name) => {
        counter.set(name, (counter.get(name) ?? 0) + 1);
      });
    });
    return toTopRows(counter, 5);
  }, [entries]);

  const tagRows = useMemo(() => {
    const counter = new Map<string, number>();
    entries.forEach((entry) => {
      extractTags(entry.tags).forEach((tag) => {
        counter.set(tag, (counter.get(tag) ?? 0) + 1);
      });
    });
    return toTopRows(counter, 5);
  }, [entries]);

  const avgEntriesPerWeek = useMemo(
    () => computeAvgEntriesPerWeek(entries),
    [entries],
  );

  const effectivenessRows = useMemo(
    () => buildFeedbackEffectivenessRows(reflections),
    [reflections],
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Статистика"
        subtitle="Данные построены по вашим записям дневника"
      />

      <EmotionDayMetricChart entries={entries} metric="valence" />
      <EmotionDayMetricChart entries={entries} metric="energy" />

      <RankedBarBlock
        title="Топ эмоций"
        subtitle="Какие эмоции чаще всего встречаются в записях"
        rows={emotionRows}
      />

      <RankedBarBlock
        title="Топ тегов"
        subtitle="Какие темы чаще всего встречаются в записях"
        rows={tagRows}
      />

      <RankedBarBlock
        title="Эффективность приложения"
        subtitle="Доли ответов после записи: легче, без изменений, хуже, пропущено"
        rows={effectivenessRows}
        valueMode="percent"
      />

      <AppUsageBlock
        totalEntries={entries.length}
        avgEntriesPerWeek={avgEntriesPerWeek}
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
});
