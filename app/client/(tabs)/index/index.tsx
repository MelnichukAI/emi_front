import CompasIcon from "@/assets/icons/compas.svg";
import VocabularyIcon from "@/assets/icons/vocabulary.svg";
import Header from "@/components/common/header";
import PrimaryButton from "@/components/common/primaryButton";
import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { getAccessToken } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import { useDiaryDraft } from "@/lib/diary-draft-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { ComponentType, useCallback, useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type SvgIconProps = {
  width: number;
  height: number;
  color: string;
};

const TILE_BORDER = "rgba(75, 69, 150, 0.15)";

type UserMeResponse = {
  email?: string | null;
  alexithymicProfile?: {
    nickname?: string | null;
  } | null;
};

type DiaryEntry = {
  id: string;
  emotion?: string | null;
  thought?: string | null;
  situation?: string | null;
  date?: string | null;
  createdAt?: string | null;
};

export default function HomeScreen() {
  const router = useRouter();
  const { resetDraft } = useDiaryDraft();
  const [userName, setUserName] = useState<string>("Пользователь");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [entriesExpanded, setEntriesExpanded] = useState(true);

  const fetchHomeData = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setEntries([]);
      setUserName("Пользователь");
      return;
    }

    try {
      const [me, diary] = await Promise.all([
        apiRequest<UserMeResponse>("/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        apiRequest<DiaryEntry[]>("/diary?all=true", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const nameFromProfile = me.alexithymicProfile?.nickname?.trim();
      const nameFromEmail = me.email?.split("@")[0]?.trim();
      setUserName(nameFromProfile || nameFromEmail || "Пользователь");

      const sorted = [...(Array.isArray(diary) ? diary : [])].sort((a, b) => {
        const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bd - ad;
      });
      setEntries(sorted.slice(0, 5));
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData]),
  );

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}`;
  };

  const greetingName = userName.trim() || "Пользователь";

  const visibleEntries = entriesExpanded ? entries : entries.slice(0, 1);

  const openEntry = (entryId: string) => {
    router.push({
      pathname: "/client/profile/entry/[entryId]",
      params: { entryId },
    });
  };

  const TileIcon = ({
    Icon,
    iconColor = colors.primary,
  }: {
    Icon: ComponentType<SvgIconProps>;
    iconColor?: string;
  }) => (
    <Icon width={40} height={40} color={iconColor} />
  );

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.scrollContent,
        Platform.OS === "web" && styles.scrollContentWeb,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <Header
          title={`С возвращением, ${greetingName}`}
          subtitle="Как вы себя чувствуете?"
          titleColor={colors.text}
          subtitleColor={colors.textThird}
          titleFontSize={24}
          titleFontWeight="600"
        />

        <PrimaryButton
          title="Создать запись"
          titleFontWeight="500"
          icon={<Ionicons name="add" size={22} color="#FFFFFF" />}
          onPress={() => {
            resetDraft();
            router.push("./create");
          }}
        />

        <View style={styles.emotionTiles}>
          <View style={styles.emotionTilesRow}>
            <Pressable
              style={({ pressed }) => [styles.emotionTile, pressed && styles.emotionTilePressed]}
              onPress={() => router.navigate("/client/reference/compass")}
              accessibilityRole="button"
              accessibilityLabel="Компас"
            >
              <TileIcon Icon={CompasIcon} />
              <Text style={styles.emotionTileLabel}>Компас</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.emotionTile, pressed && styles.emotionTilePressed]}
              onPress={() => router.navigate("/client/reference/dictionary")}
              accessibilityRole="button"
              accessibilityLabel="Словарь"
            >
              <TileIcon Icon={VocabularyIcon} />
              <Text style={styles.emotionTileLabel}>Словарь</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.entriesSection}>
        <View
          style={[
            styles.entriesPanel,
            entriesExpanded &&
              entries.length > 1 &&
              styles.entriesPanelExpanded,
          ]}
        >
          <Pressable
            onPress={() => setEntriesExpanded((v) => !v)}
            style={styles.entriesToggle}
            accessibilityRole="button"
            accessibilityState={{ expanded: entriesExpanded }}
            accessibilityLabel={
              entriesExpanded
                ? "Скрыть последние записи"
                : "Показать последние записи"
            }
          >
            <View style={styles.entriesToggleRow}>
              <Text style={styles.entriesToggleTitle}>Последние записи</Text>
              <Ionicons
                name={entriesExpanded ? "chevron-down" : "chevron-forward"}
                size={22}
                color={colors.primary}
              />
            </View>
          </Pressable>

          <View style={styles.entriesInner}>
            <View style={styles.entriesList}>
              {visibleEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => openEntry(entry.id)}
                  style={({ pressed }) => pressed && styles.entryCardPressed}
                  accessibilityRole="button"
                  accessibilityLabel="Открыть запись"
                >
                  <EntryCard
                    emotion={entry.emotion || "Без названия эмоции"}
                    text={entry.thought || entry.situation || "Запись без текста"}
                    date={formatDate(entry.date || entry.createdAt)}
                    noOuterMargin
                    bodyLines={4}
                    emotionColor={colors.primary}
                    bodyColor={colors.textThird}
                  />
                </Pressable>
              ))}
            </View>
            {entriesExpanded && entries.length === 0 ? (
              <Text style={styles.emptyHint}>
                Пока нет записей для отображения.
              </Text>
            ) : null}
            {entriesExpanded && entries.length === 1 ? (
              <Text style={styles.emptyHint}>
                Пока нет других записей для отображения.
              </Text>
            ) : null}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  /** На вебе тени карточек не обрезались контейнером скролла */
  scrollContentWeb: {
    overflow: "visible",
  },
  hero: {
    paddingBottom: 8,
  },
  emotionTiles: {
    marginTop: 28,
    paddingHorizontal: 20,
    gap: 20,
  },
  emotionTilesRow: {
    flexDirection: "row",
    gap: 14,
  },
  emotionTile: {
    flex: 1,
    aspectRatio: 1,
    maxHeight: 200,
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: TILE_BORDER,
  },
  emotionTileLabel: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
    textAlign: "center",
  },
  emotionTilePressed: {
    opacity: 0.88,
  },
  /** Весь блок «Последние записи» — 24px от краёв экрана */
  entriesSection: {
    marginHorizontal: 24,
    marginTop: 20,
  },
  entriesPanel: {
    flexGrow: 1,
    backgroundColor: colors.entryCard,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  entriesToggleTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.text,
  },
  /** Контент списка — 16px от внутренних границ панели */
  entriesInner: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  entriesList: {
    gap: 12,
  },
  entryCardPressed: {
    opacity: 0.92,
  },
  emptyHint: {
    marginTop: 12,
    fontSize: 15,
    color: colors.subtext,
    lineHeight: 22,
  },
});
