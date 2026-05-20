import BackChipButton from "@/components/common/backChipButton";
import DiaryEntryReadOnlyContent from "@/components/diary/DiaryEntryReadOnlyContent";
import { diaryEntryDetailStyles as styles } from "@/components/diary/diaryEntryDetailStyles";
import type { DiaryEntryDetail } from "@/lib/diary-entry-detail";
import { apiRequest } from "@/lib/api";
import { getAccessToken } from "@/lib/auth-session";
import { diaryScreenTopPadding } from "@/lib/diary-screen-top-padding";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TherapistEntryDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { entryId, linkId } = useLocalSearchParams<{
    entryId?: string;
    linkId?: string;
  }>();

  const resolvedEntryId = Array.isArray(entryId) ? entryId[0] : entryId;
  const resolvedLinkId = Array.isArray(linkId) ? linkId[0] : linkId;

  const [entry, setEntry] = useState<DiaryEntryDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEntry = useCallback(async () => {
    const id = resolvedEntryId?.trim();
    const clientLinkId = resolvedLinkId?.trim();
    if (!id || !clientLinkId) {
      setEntry(null);
      setLoading(false);
      return;
    }

    const token = getAccessToken();
    if (!token) {
      setEntry(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const report = await apiRequest<DiaryEntryDetail[]>(
        `/therapist-clients/${clientLinkId}/report`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const found = (Array.isArray(report) ? report : []).find(
        (item) => item.id === id,
      );
      setEntry(found ?? null);
    } catch {
      setEntry(null);
    } finally {
      setLoading(false);
    }
  }, [resolvedEntryId, resolvedLinkId]);

  useFocusEffect(
    useCallback(() => {
      void loadEntry();
    }, [loadEntry]),
  );

  return (
    <View style={styles.root}>
      <View
        style={[styles.header, { paddingTop: diaryScreenTopPadding(insets.top) }]}
      >
        <Text style={styles.headerTitle}>Запись дневника</Text>
        <View style={styles.headerActions}>
          <BackChipButton
            onPress={() => router.replace("/therapist/entries")}
            style={styles.backChip}
          />
        </View>
        <Text style={styles.lead}>
          Показываются только заполненные поля записи.
        </Text>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 24 + insets.bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <DiaryEntryReadOnlyContent entry={entry} loading={loading} />
      </ScrollView>
    </View>
  );
}
