import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { colors } from "../../../constants/colors";
import AppUsageBlock from "../../../components/stats/AppUsageBlock";
import RankedBarBlock from "../../../components/stats/RankedBarBlock";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type TherapistClientLink = {
  id: string;
  alexithymicId: string;
  clientName?: string | null;
  clientEmail?: string | null;
};

type DiaryEntry = {
  id: string;
  emotion?: string | null;
  tags?: unknown;
  createdAt?: string;
};

function normalizeTags(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof raw === "string") {
    const value = raw.trim();
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      // Keep fallback below for plain text formats.
    }

    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

export default function TherapistClientOverviewScreen() {
  const [clientName, setClientName] = useState("Клиент");
  const [clientEmail, setClientEmail] = useState("—");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const links = await apiRequest<TherapistClientLink[]>("/client-therapist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const first = links.find((l) => Boolean(l.alexithymicId));
      if (!first) {
        setEntries([]);
        setClientName("Клиент");
        setClientEmail("—");
        return;
      }
      setClientName(first.clientName?.trim() || "Клиент");
      setClientEmail(first.clientEmail?.trim() || "—");
      const report = await apiRequest<DiaryEntry[]>(`/therapist-clients/${first.id}/report`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEntries(report);
    } catch {
      setClientName("Клиент");
      setClientEmail("—");
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const lastEntryLabel = useMemo(() => {
    if (entries.length === 0) return "Пока нет записей";
    const latest = entries
      .map((e) => (e.createdAt ? new Date(e.createdAt) : null))
      .filter((d): d is Date => Boolean(d && !Number.isNaN(d.getTime())))
      .sort((a, b) => b.getTime() - a.getTime())[0];
    if (!latest) return "Пока нет записей";
    return `Последняя запись: ${latest.toLocaleDateString("ru-RU")}`;
  }, [entries]);

  const topEmotions = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((entry) => {
      const raw = (entry.emotion || "").trim();
      if (!raw) return;
      map.set(raw, (map.get(raw) || 0) + 1);
    });
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

  const topTags = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((entry) => {
      normalizeTags(entry.tags).forEach((tag) => {
        const normalized = (tag || "").trim();
        if (!normalized) return;
        map.set(normalized, (map.get(normalized) || 0) + 1);
      });
    });
    return [...map.entries()]
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [entries]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.clientHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {(clientName.slice(0, 2) || "КЛ").toUpperCase()}
          </Text>
        </View>
        <View>
          <Text style={styles.clientCode}>{clientName}</Text>
          <Text style={styles.subtle}>{clientEmail}</Text>
          <Text style={styles.subtle}>{lastEntryLabel}</Text>
        </View>
      </View>

      <RankedBarBlock
        title="Топ-эмоции"
        subtitle="Считается по дневниковым записям клиента."
        rows={topEmotions.length > 0 ? topEmotions : [{ label: "Нет данных", count: 0 }]}
      />

      <RankedBarBlock
        title="Топ-теги"
        subtitle="Популярные темы из записей клиента."
        rows={topTags.length > 0 ? topTags : [{ label: "Нет данных", count: 0 }]}
      />

      <AppUsageBlock
        totalEntries={entries.length}
        subtitle="Общее число записей выбранного клиента."
      />
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
});
