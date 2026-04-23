import AppUsageBlock from "@/components/stats/AppUsageBlock";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import { getAccessToken } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

type DiaryEntryResponse = {
  id: string;
  emotion?: string | null;
  tags?: string | null;
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

  const loadStats = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setEntries([]);
      return;
    }
    try {
      const data = await apiRequest<DiaryEntryResponse[]>("/diary?all=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEntries(Array.isArray(data) ? data : []);
    } catch {
      setEntries([]);
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Статистика</Text>
        <Text style={styles.pageSubtitle}>
          Данные построены по вашим записям дневника с сервера
        </Text>
      </View>

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

      <AppUsageBlock
        totalEntries={entries.length}
        subtitle="Общее число записей, рассчитанное из /diary?all=true"
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
  header: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 8,
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
  },
  pageSubtitle: {
    marginTop: 8,
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
});
