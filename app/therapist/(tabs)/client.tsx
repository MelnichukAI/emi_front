import AppUsageBlock from "@/components/stats/AppUsageBlock";
import EmotionDayMetricChart from "@/components/stats/EmotionDayMetricChart";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { screenTopPadding } from "@/lib/screen-top-padding";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

function clientLabel(link: TherapistClientLink): string {
  return link.clientName?.trim() || link.clientEmail?.trim() || "Клиент";
}

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
  const insets = useSafeAreaInsets();
  const [activeClients, setActiveClients] = useState<TherapistClientLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [statEntries, setStatEntries] = useState<EmotionStatEntry[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const selectedClient = useMemo(
    () => activeClients.find((link) => link.id === selectedLinkId) ?? null,
    [activeClients, selectedLinkId],
  );

  const loadActiveClients = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    setLoadingClients(true);
    setLoadError(null);
    try {
      const data = await apiRequest<TherapistClientLink[]>("/client-therapist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const active = (Array.isArray(data) ? data : []).filter(
        (item) => item.status === "ACTIVE" && Boolean(item.alexithymicId),
      );
      setActiveClients(active);
      setSelectedLinkId((prev) => {
        if (prev && active.some((link) => link.id === prev)) return prev;
        return active[0]?.id ?? null;
      });
    } catch (error) {
      setActiveClients([]);
      setSelectedLinkId(null);
      setLoadError(
        error instanceof Error ? error.message : "Не удалось загрузить клиентов",
      );
    } finally {
      setLoadingClients(false);
    }
  }, []);

  const loadStats = useCallback(async (linkId: string) => {
    const token = getAccessToken();
    if (!token) return;

    setLoadingStats(true);
    setLoadError(null);
    try {
      const data = await apiRequest<EmotionStatEntry[]>(
        `/therapist-clients/${linkId}/emotion-statistics`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      setStatEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatEntries([]);
      setLoadError(
        error instanceof Error ? error.message : "Не удалось загрузить статистику",
      );
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadActiveClients();
    }, [loadActiveClients]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!selectedLinkId) {
        setStatEntries([]);
        return;
      }
      void loadStats(selectedLinkId);
    }, [selectedLinkId, loadStats]),
  );

  const handleSelectClient = (linkId: string) => {
    setSelectedLinkId(linkId);
    setPickerOpen(false);
  };

  const chartEntries = useMemo(
    () =>
      statEntries.map((e) => ({
        emotion: emotionStringForChart(e),
        createdAt: e.createdAt ?? null,
      })),
    [statEntries],
  );

  const emotionRows = useMemo(() => {
    const counter = new Map<string, number>();
    statEntries.forEach((entry) => {
      namesFromStatEntry(entry).forEach((name) => {
        counter.set(name, (counter.get(name) ?? 0) + 1);
      });
    });
    return toTopRows(counter, 5);
  }, [statEntries]);

  const selectedClientName = selectedClient
    ? clientLabel(selectedClient)
    : "клиента";

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
        <Text style={styles.title}>Статистика</Text>

        <View style={styles.pickerRow}>
          <Text style={styles.pickerLabel}>Выбор клиента:</Text>
          <Pressable
            style={({ pressed }) => [
              styles.pickerControl,
              pressed && styles.pressed,
              (loadingClients || activeClients.length === 0) &&
                styles.pickerControlDisabled,
            ]}
            onPress={() => setPickerOpen(true)}
            disabled={loadingClients || activeClients.length === 0}
          >
            <Text style={styles.pickerValue} numberOfLines={1}>
              {loadingClients
                ? "Загрузка…"
                : activeClients.length === 0
                  ? "Нет активных клиентов"
                  : selectedClient
                    ? clientLabel(selectedClient)
                    : "Выберите клиента"}
            </Text>
            <Ionicons name="chevron-down" size={18} color={colors.primary} />
          </Pressable>
        </View>

        {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

        {loadingStats ? (
          <ActivityIndicator style={styles.loader} color={colors.primary} />
        ) : null}

        {!loadingStats && selectedLinkId && statEntries.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              У {selectedClientName} пока нет записей для статистики.
            </Text>
          </View>
        ) : null}

        {!loadingStats && selectedLinkId && statEntries.length > 0 ? (
          <>
            <EmotionDayMetricChart entries={chartEntries} metric="valence" />
            <EmotionDayMetricChart entries={chartEntries} metric="energy" />

            <RankedBarBlock
              title="Топ эмоций"
              subtitle={`По клиенту «${selectedClientName}»: имена из справочника и поле emotion`}
              rows={emotionRows}
            />

            <AppUsageBlock
              totalEntries={statEntries.length}
              subtitle={`Число записей клиента «${selectedClientName}» в выборке emotion-statistics`}
            />
          </>
        ) : null}
      </ScrollView>

      <Modal
        visible={pickerOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerOpen(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPickerOpen(false)}
        >
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Активные клиенты</Text>
            <FlatList
              data={activeClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const selected = item.id === selectedLinkId;
                return (
                  <Pressable
                    style={({ pressed }) => [
                      styles.modalOption,
                      selected && styles.modalOptionSelected,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleSelectClient(item.id)}
                  >
                    <Text
                      style={[
                        styles.modalOptionText,
                        selected && styles.modalOptionTextSelected,
                      ]}
                    >
                      {clientLabel(item)}
                    </Text>
                    {selected ? (
                      <Ionicons name="checkmark" size={18} color={colors.primary} />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Нет активных клиентов</Text>
              }
            />
            <Pressable
              style={({ pressed }) => [
                styles.modalClose,
                pressed && styles.pressed,
              ]}
              onPress={() => setPickerOpen(false)}
            >
              <Text style={styles.modalCloseText}>Закрыть</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
