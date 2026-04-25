import ProfileJournalSection from "@/components/profile/ProfileJournalSection";
import ProfilePersonalCard from "@/components/profile/ProfilePersonalCard";
import ProfileTherapistCard from "@/components/profile/ProfileTherapistCard";
import { colors } from "@/constants/colors";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";
import { apiRequest } from "@/lib/api";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

type UserMeResponse = {
  id: string;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
  alexithymicProfile?: {
    nickname?: string | null;
  } | null;
};

type DiaryEntryResponse = {
  id: string;
  emotion?: string | null;
  thought?: string | null;
  situation?: string | null;
  createdAt?: string | null;
};

type TherapistClientLink = {
  id: string;
  alexithymicId: string;
  therapistId?: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
  therapist?: {
    fullName?: string | null;
    code?: string | null;
    userId?: string;
  } | null;
};

type JournalEntry = {
  id: string;
  emotion: string;
  text: string;
  date: string;
};

function formatMemberSince(value?: string | null): string {
  if (!value) return "неизвестно";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "неизвестно";
  return date.toLocaleDateString("ru-RU", {
    month: "long",
    year: "numeric",
  });
}

function formatDiaryDate(value?: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function ProfileScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("Пользователь");
  const [email, setEmail] = useState("—");
  const [roleLabel, setRoleLabel] = useState("Клиент");
  const [memberSince, setMemberSince] = useState("неизвестно");
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [therapistCode, setTherapistCode] = useState("");
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [links, setLinks] = useState<TherapistClientLink[]>([]);

  const loadProfile = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;

    try {
      const [me, diary, therapistLinks] = await Promise.all([
        apiRequest<UserMeResponse>("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<DiaryEntryResponse[]>("/diary?all=true", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<TherapistClientLink[]>("/therapist-clients", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const nameFromNickname = me.alexithymicProfile?.nickname?.trim();
      const nameFromEmail = me.email?.split("@")[0]?.trim();

      setFullName(nameFromNickname || nameFromEmail || "Пользователь");
      setEmail(me.email?.trim() || "—");
      setRoleLabel(me.role === "ALEXITHYMIC" ? "Клиент" : me.role || "Клиент");
      setMemberSince(formatMemberSince(me.createdAt));
      const normalizedLinks = Array.isArray(therapistLinks) ? therapistLinks : [];
      setLinks(normalizedLinks);

      const mappedEntries = (Array.isArray(diary) ? diary : [])
        .sort((a, b) => {
          const ad = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const bd = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return bd - ad;
        })
        .map((entry) => ({
          id: entry.id,
          emotion: entry.emotion?.trim() || "Без названия эмоции",
          text: entry.thought?.trim() || entry.situation?.trim() || "Запись без текста",
          date: formatDiaryDate(entry.createdAt),
        }));
      setJournalEntries(mappedEntries);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось загрузить профиль";
      Alert.alert("Ошибка", message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const linkedCount = useMemo(
    () => links.filter((link) => link.status === "ACTIVE").length,
    [links]
  );
  const activeLink = useMemo(
    () => links.find((link) => link.status === "ACTIVE"),
    [links]
  );
  const linkedTherapistName = activeLink?.therapist?.fullName?.trim() ?? "";
  const linkedTherapistCode = activeLink?.therapist?.code?.trim() ?? "";

  const handleLinkTherapist = async () => {
    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }

    const code = therapistCode.trim();
    if (!code) {
      Alert.alert("Код не заполнен", "Введите код терапевта, например T-c05c0f79.");
      return;
    }

    try {
      setLinking(true);
      await apiRequest<{ id: string }>("/therapist-clients", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });
      setTherapistCode("");
      Alert.alert("Готово", "Терапевт успешно привязан.");
      await loadProfile();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось привязать терапевта";
      Alert.alert("Ошибка", message);
    } finally {
      setLinking(false);
    }
  };

  const handleUnlinkTherapist = () => {
    if (!activeLink) return;
    const unlinkRequest = async () => {
      const token = getAccessToken();
      if (!token) {
        Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
        return;
      }
      try {
        setUnlinking(true);
        await apiRequest(`/therapist-clients/${activeLink.id}/status`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: "FINISHED" }),
        });
        Alert.alert("Готово", "Терапевт отвязан.");
        await loadProfile();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Не удалось отвязать терапевта";
        Alert.alert("Ошибка", message);
      } finally {
        setUnlinking(false);
      }
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Вы точно хотите отвязать терапевта?");
      if (confirmed) unlinkRequest();
      return;
    }

    Alert.alert("Отвязать терапевта", "Вы точно хотите отвязать терапевта?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Отвязать",
        style: "destructive",
        onPress: unlinkRequest,
      },
    ]);
  };

  const handleLogout = () => {
    const doLogout = () => {
      clearAuthSession();
      router.replace("/auth/login");
    };

    if (Platform.OS === "web") {
      const confirmed = window.confirm("Вы точно хотите выйти из аккаунта?");
      if (confirmed) doLogout();
      return;
    }

    Alert.alert("Выход", "Вы точно хотите выйти из аккаунта?", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Выйти",
        style: "destructive",
        onPress: doLogout,
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <Text style={styles.pageTitle}>Профиль</Text>
        <Pressable
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={() => router.push("/client/profile/oae")}
        >
          <Text style={styles.headerActionText}>ОАЭ</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={() => router.push("/client/profile/settings")}
        >
          <Text style={styles.headerActionText}>Настройки</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
          onPress={handleLogout}
        >
          <Text style={styles.logoutHeaderText}>Выйти</Text>
        </Pressable>
      </View>

      <ProfilePersonalCard
        user={{
          fullName,
          email,
          roleLabel,
          memberSinceLabel: memberSince,
        }}
      />

      <ProfileTherapistCard
        therapistCode={therapistCode}
        onChangeTherapistCode={setTherapistCode}
        onLinkTherapist={handleLinkTherapist}
        onUnlinkTherapist={handleUnlinkTherapist}
        linking={linking}
        unlinking={unlinking}
        linkedCount={linkedCount}
        linkedTherapistName={linkedTherapistName}
        linkedTherapistCode={linkedTherapistCode}
        hasLinkedTherapist={Boolean(activeLink)}
      />

      <ProfileJournalSection entries={journalEntries} />
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.primary,
    marginRight: "auto",
  },
  headerAction: {
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  headerActionText: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.primary,
  },
  logoutHeaderText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E35D5D",
  },
  pressed: {
    opacity: 0.8,
  },
});
