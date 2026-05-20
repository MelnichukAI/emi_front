import AppUsageBlock from "@/components/stats/AppUsageBlock";
import EmotionDayMetricChart from "@/components/stats/EmotionDayMetricChart";
import RankedBarBlock from "@/components/stats/RankedBarBlock";
import { colors } from "@/constants/colors";
import {
  buildTopEmotionRows,
  buildTopTagRows,
  reflectionsFromEntries,
  toChartEntries,
  type DiaryStatEntry,
} from "@/lib/diary-entry-statistics";
import { buildFeedbackEffectivenessRows, computeAvgEntriesPerWeek } from "@/lib/feedback-statistics";
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
  StyleSheet,
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
type EmotionStatEntry = DiaryStatEntry & {
  id: string;
  visibility?: string | null;
  emotions?: Array<{
    emotion?: { id?: string; name?: string | null } | null;
  }> | null;
};

function clientLabel(link: TherapistClientLink): string {
  return link.clientName?.trim() || link.clientEmail?.trim() || "Клиент";
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
        { headers: { Authorization: `Bearer ${token}` } },
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

  const chartEntries = useMemo(() => toChartEntries(statEntries), [statEntries]);

  const emotionRows = useMemo(
    () => buildTopEmotionRows(statEntries),
    [statEntries],
  );

  const tagRows = useMemo(() => buildTopTagRows(statEntries), [statEntries]);

  const avgEntriesPerWeek = useMemo(
    () => computeAvgEntriesPerWeek(statEntries),
    [statEntries],
  );

  const effectivenessRows = useMemo(
    () => buildFeedbackEffectivenessRows(reflectionsFromEntries(statEntries)),
    [statEntries],
  );

  const selectedClientName = selectedClient
    ? clientLabel(selectedClient)
    : "клиента";
  const showSecondaryStats = false;

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          pickerStyles.content,
          { paddingTop: screenTopPadding(insets.top) },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={pickerStyles.topSection}>
          <Text style={[styles.title, pickerStyles.screenTitle]}>Статистика</Text>

          <View style={[styles.pickerRow, pickerStyles.pickerBlock]}>
            <Pressable
              style={({ pressed }) => [
                styles.pickerControl,
                pickerStyles.pickerControl,
                pressed && styles.pressed,
                (loadingClients || activeClients.length === 0) &&
                  styles.pickerControlDisabled,
              ]}
              onPress={() => setPickerOpen(true)}
              disabled={loadingClients || activeClients.length === 0}
            >
              <Text style={[styles.pickerValue, pickerStyles.pickerValue]} numberOfLines={2}>
                {loadingClients
                  ? "Загрузка…"
                  : activeClients.length === 0
                    ? "Нет активных клиентов"
                    : "Нажмите, чтобы выбрать клиента"}
              </Text>
            </Pressable>
            <Text style={[styles.pickerLabel, pickerStyles.clientName]} numberOfLines={2}>
              {loadingClients
                ? "Загрузка…"
                : activeClients.length === 0
                  ? "Нет активных клиентов"
                  : selectedClient
                    ? clientLabel(selectedClient)
                    : "Клиент не выбран"}
            </Text>
          </View>
        </View>

        <View style={pickerStyles.statsBlock}>
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

              <RankedBarBlock title="Топ эмоций" rows={emotionRows} />

              {showSecondaryStats ? (
                <>
                  {/* TODO(v2): вернуть блоки после корректировки данных и UX */}
                  <RankedBarBlock title="Топ тегов" rows={tagRows} />
                  <RankedBarBlock
                    title="Эффективность приложения"
                    subtitle="Доли выборов после записи"
                    rows={effectivenessRows}
                    valueMode="percent"
                  />
                </>
              ) : null}

              <AppUsageBlock
                totalEntries={statEntries.length}
                avgEntriesPerWeek={avgEntriesPerWeek}
              />
            </>
          ) : null}
        </View>
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

const CLIENT_NAME_VERTICAL_GAP = 16;

const pickerStyles = StyleSheet.create({
  content: {
    paddingBottom: 32,
  },
  topSection: {
    paddingHorizontal: 16,
    gap: 12,
  },
  screenTitle: {
    fontSize: 24,
    color: colors.text,
  },
  pickerBlock: {
    gap: CLIENT_NAME_VERTICAL_GAP,
  },
  statsBlock: {
    marginTop: CLIENT_NAME_VERTICAL_GAP,
    gap: 12,
  },
  clientName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  pickerControl: {
    justifyContent: "center",
    alignSelf: "stretch",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pickerValue: {
    flex: 1,
    width: "100%",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
