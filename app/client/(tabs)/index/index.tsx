import Header from "@/components/common/header";
import PrimaryButton from "@/components/common/primaryButton";
import SecondaryButton from "@/components/common/secondaryButton";
import EntryCard from "@/components/journal/entryCard";
import { colors } from "@/constants/colors";
import { useHomeRecentEntries } from "@/lib/home-recent-entries-context";
import { getAccessToken } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import { useDiaryDraft } from "@/lib/diary-draft-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

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
  const { expanded, toggleExpanded } = useHomeRecentEntries();
  const [userName, setUserName] = useState<string>("Пользователь");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);

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
      setEntries(sorted.slice(0, 3));
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
    return date.toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={{ paddingBottom: 30 }}>
        <Header name={userName} />

        <PrimaryButton
          title="Создать запись"
          onPress={() => {
            resetDraft();
            router.push("./create");
          }}
        />
        <SecondaryButton
          title="Определить эмоцию"
          onPress={() => router.push("./determine-emotion")}
        />

        <Pressable
          onPress={toggleExpanded}
          style={styles.entriesToggle}
          accessibilityRole="button"
          accessibilityState={{ expanded }}
          accessibilityLabel={
            expanded
              ? "Скрыть последние записи"
              : "Показать последние записи"
          }
        >
          <View style={styles.entriesToggleLine} />
          <View style={styles.entriesToggleRow}>
            <Text style={styles.entriesToggleTitle}>Последние записи</Text>
            <Ionicons
              name={expanded ? "chevron-down" : "chevron-forward"}
              size={22}
              color={colors.primary}
            />
          </View>
        </Pressable>

        {expanded ? (
          <>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                emotion={entry.emotion || "Без названия эмоции"}
                text={entry.thought || entry.situation || "Запись без текста"}
                date={formatDate(entry.date || entry.createdAt)}
              />
            ))}
            {entries.length === 0 ? (
              <Text
                style={{
                  marginHorizontal: 20,
                  marginTop: 12,
                  color: colors.subtext,
                }}
              >
                Пока нет записей для отображения.
              </Text>
            ) : null}
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  entriesToggle: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  entriesToggleLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.subtext,
    opacity: 0.5,
    marginBottom: 10,
  },
  entriesToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  entriesToggleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
  },
});
