import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { formatEntryDateShort } from "@/lib/diary-entry-detail";
import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
import { apiRequest } from "../../../../lib/api";
import { getAccessToken } from "../../../../lib/auth-session";
import { screenTopPadding } from "../../../../lib/screen-top-padding";

type TherapistClientLink = {
  id: string;
  therapistId: string;
  alexithymicId: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
  clientName?: string | null;
  clientEmail?: string | null;
};

type DiaryReportEntry = {
  id: string;
  createdAt?: string | null;
  date?: string | null;
  emotion?: string | null;
  thought?: string | null;
  situation?: string | null;
  reaction?: string | null;
  behavior?: string | null;
  behaviorAlt?: string | null;
  tags?: string | null;
  visibility?: string | null;
};

function clientLabel(link: TherapistClientLink): string {
  return link.clientName?.trim() || link.clientEmail?.trim() || "Клиент";
}

function entryPreview(entry: DiaryReportEntry): string {
  return (
    entry.thought?.trim() ||
    entry.situation?.trim() ||
    entry.reaction?.trim() ||
    entry.behavior?.trim() ||
    "Без текста"
  );
}

export default function TherapistEntriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeClients, setActiveClients] = useState<TherapistClientLink[]>([]);
  const [selectedLinkId, setSelectedLinkId] = useState<string | null>(null);
  const [entries, setEntries] = useState<DiaryReportEntry[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(false);
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
      const active = data.filter(
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

  const loadEntries = useCallback(async (linkId: string) => {
    const token = getAccessToken();
    if (!token) return;

    setLoadingEntries(true);
    setLoadError(null);
    try {
      const data = await apiRequest<DiaryReportEntry[]>(
        `/therapist-clients/${linkId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const sorted = [...(Array.isArray(data) ? data : [])].sort(
        (a, b) =>
          new Date(b.createdAt ?? b.date ?? 0).getTime() -
          new Date(a.createdAt ?? a.date ?? 0).getTime(),
      );
      setEntries(sorted);
    } catch (error) {
      setEntries([]);
      setLoadError(
        error instanceof Error ? error.message : "Не удалось загрузить записи",
      );
    } finally {
      setLoadingEntries(false);
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
        setEntries([]);
        return;
      }
      void loadEntries(selectedLinkId);
    }, [selectedLinkId, loadEntries]),
  );

  const handleSelectClient = (linkId: string) => {
    setSelectedLinkId(linkId);
    setPickerOpen(false);
  };

  const openEntry = (entry: DiaryReportEntry) => {
    if (!selectedLinkId) return;
    router.push({
      pathname: "/therapist/entries/[entryId]",
      params: { entryId: entry.id, linkId: selectedLinkId },
    });
  };

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
        <Text style={[styles.title, pickerStyles.screenTitle]}>
          Записи клиентов
        </Text>

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

        <View style={pickerStyles.entriesBlock}>
          {loadError ? <Text style={styles.errorText}>{loadError}</Text> : null}

          {loadingEntries ? (
            <ActivityIndicator style={styles.loader} color={colors.primary} />
          ) : null}

          {!loadingEntries && selectedLinkId && entries.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                У этого клиента пока нет записей, доступных терапевту.
              </Text>
            </View>
          ) : null}

          {!loadingEntries && entries.length > 0 ? (
            <View style={styles.entriesList}>
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  emotion={entry.emotion?.trim() || "Запись"}
                  text={entryPreview(entry)}
                  date={formatEntryDateShort(entry.createdAt ?? entry.date)}
                  noOuterMargin
                  bodyLines={4}
                  onPress={() => openEntry(entry)}
                />
              ))}
            </View>
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
  screenTitle: {
    fontSize: 24,
    color: colors.text,
  },
  pickerBlock: {
    gap: CLIENT_NAME_VERTICAL_GAP,
  },
  entriesBlock: {
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
