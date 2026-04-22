import PrimaryButton from "@/components/common/primaryButton";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import Header from "../../../components/common/header";
import SecondaryButton from "../../../components/common/secondaryButton";
import EntryCard from "../../../components/journal/entryCard";
import { colors } from "../../../constants/colors";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

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
  const [userName, setUserName] = useState<string>("Пользователь");
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());

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
      setEntries((Array.isArray(diary) ? diary : []).slice(0, 5));
      setHiddenIds(new Set());
    } catch {
      setEntries([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  const visibleEntries = useMemo(
    () => entries.filter((entry) => !hiddenIds.has(entry.id)),
    [entries, hiddenIds]
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

  const hideEntry = (id: string) => {
    setHiddenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }}>
      <View style={{ paddingBottom: 30 }}>
        <Header name={userName} />

        <PrimaryButton
          title="Создать запись"
          onPress={() => router.navigate("/client/create")}
        />
        <SecondaryButton title="Определить эмоцию" />

        <Text style={{ marginLeft: 20, marginTop: 20 }}>Последние записи</Text>

        {visibleEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            emotion={entry.emotion || "Без названия эмоции"}
            text={entry.thought || entry.situation || "Запись без текста"}
            date={formatDate(entry.date || entry.createdAt)}
            onHide={() => hideEntry(entry.id)}
          />
        ))}

        {visibleEntries.length === 0 ? (
          <Text style={{ marginHorizontal: 20, marginTop: 12, color: colors.subtext }}>
            Пока нет записей для отображения.
          </Text>
        ) : null}
      </View>
    </ScrollView>
  );
}
