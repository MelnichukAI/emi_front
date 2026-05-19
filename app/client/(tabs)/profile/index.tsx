import LogoutIcon from "@/assets/icons/log_out.svg";
import Header from "@/components/common/header";
import ProfileJournalSection from "@/components/profile/ProfileJournalSection";
import ProfilePersonalCard from "@/components/profile/ProfilePersonalCard";
import ProfileTherapistCard from "@/components/profile/ProfileTherapistCard";
import { colors } from "@/constants/colors";
import { apiRequest } from "@/lib/api";
import {
  clearAuthSession,
  getAccessToken,
  updateAuthCodes,
} from "@/lib/auth-session";
import { getOaeScore, type OaeScoreSummary } from "@/lib/oae-score-session";
import {
  buildProfileJournalEntry,
  type ProfileJournalListEntry,
} from "@/lib/profile-journal-filter";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

type UserMeResponse = {
  id: string;
  email?: string | null;
  role?: string | null;
  createdAt?: string | null;
  alexithymicProfile?: {
    nickname?: string | null;
    code?: string | null;
  } | null;
};

type DiaryEntryResponse = {
  id: string;
  emotion?: string | null;
  thought?: string | null;
  situation?: string | null;
  reaction?: string | null;
  behavior?: string | null;
  behaviorAlt?: string | null;
  tags?: string | null;
  visibility?: "PRIVATE" | "THERAPIST" | string | null;
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
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}.${month}`;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [fullName, setFullName] = useState("Пользователь");
  const [email, setEmail] = useState("—");
  const [roleLabel, setRoleLabel] = useState("Клиент");
  const [memberSince, setMemberSince] = useState("неизвестно");
  const [journalEntries, setJournalEntries] = useState<ProfileJournalListEntry[]>(
    [],
  );
  const [therapistCode, setTherapistCode] = useState("");
  const [clientProfileCode, setClientProfileCode] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);
  const [unlinking, setUnlinking] = useState(false);
  const [links, setLinks] = useState<TherapistClientLink[]>([]);
  const [oaeScore, setOaeScoreState] = useState<OaeScoreSummary | null>(
    () => getOaeScore(),
  );

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
      const clientCode = me.alexithymicProfile?.code?.trim() ?? null;
      setClientProfileCode(clientCode);
      updateAuthCodes({ clientCode });
      const normalizedLinks = Array.isArray(therapistLinks) ? therapistLinks : [];
      setLinks(normalizedLinks);

      const mappedEntries = (Array.isArray(diary) ? diary : []).map((entry) =>
        buildProfileJournalEntry(entry, formatDiaryDate),
      );
      mappedEntries.sort((a, b) => b.createdAtMs - a.createdAtMs);
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
      setOaeScoreState(getOaeScore());
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
        await apiRequest("/therapist-client", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: activeLink.id,
            status: "FINISHED",
          }),
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

  const handleCopyClientCode = async () => {
    const code = clientProfileCode?.trim();
    if (!code) {
      Alert.alert(
        "Код недоступен",
        "Код клиента появится после входа или обновления профиля."
      );
      return;
    }
    try {
      await Clipboard.setStringAsync(code);
      if (Platform.OS === "web") {
        window.alert("Код скопирован в буфер обмена.");
        return;
      }
      Alert.alert("Готово", "Код скопирован в буфер обмена.");
    } catch {
      Alert.alert("Ошибка", "Не удалось скопировать код.");
    }
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

  const handleOpenJournalEntry = (entryId: string) => {
    router.push({
      pathname: "/client/profile/entry/[entryId]",
      params: { entryId },
    });
  };

  const handleToggleEntryVisibility = async (
    entryId: string,
    nextValue: boolean
  ) => {
    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }

    const nextVisibility = nextValue ? "THERAPIST" : "PRIVATE";

    setJournalEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, visibilityUpdating: true } : entry
      )
    );

    try {
      await apiRequest(`/diary/${entryId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ visibility: nextVisibility }),
      });

      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId
            ? {
                ...entry,
                visibleToTherapist: nextValue,
                visibilityUpdating: false,
              }
            : entry
        )
      );
    } catch (error) {
      setJournalEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, visibilityUpdating: false } : entry
        )
      );
      const message =
        error instanceof Error ? error.message : "Не удалось обновить видимость записи";
      Alert.alert("Ошибка", message);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Header
        title="Профиль"
        trailing={
          <Pressable
            style={({ pressed }) => [styles.headerAction, pressed && styles.pressed]}
            onPress={handleLogout}
          >
            <LogoutIcon width={24} height={24} color={colors.subtext} />
          </Pressable>
        }
      />

      <ProfilePersonalCard
        user={{
          fullName,
          email,
          roleLabel,
          memberSinceLabel: memberSince,
        }}
      />

      <Pressable
        onPress={() => router.push("/client/profile/oae-result")}
        style={({ pressed }) => [styles.oaeCard, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Открыть результаты теста на алекситимию"
      >
        <Text style={styles.oaeTitle}>Тест на алекситимию</Text>
        {oaeScore ? (
          <>
            <View style={styles.oaeScoreRow}>
              <Text style={styles.oaeScoreValue}>{oaeScore.total}</Text>
              <Text style={styles.oaeScoreCaption}>баллов всего</Text>
            </View>
            <View style={styles.oaeBreakdown}>
              <Text style={styles.oaeBreakdownLine}>
                Определение чувств: {oaeScore.identifyFeelings}
              </Text>
              <Text style={styles.oaeBreakdownLine}>
                Описание чувств: {oaeScore.describeFeelings}
              </Text>
              <Text style={styles.oaeBreakdownLine}>
                Внешне ориентированное мышление: {oaeScore.externalThinking}
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.oaeEmpty}>
            Тест ещё не пройден. Нажмите, чтобы открыть.
          </Text>
        )}
      </Pressable>

      <Pressable
        onPress={() => void handleCopyClientCode()}
        style={({ pressed }) => [
          styles.clientCodeCard,
          !clientProfileCode?.trim() && styles.clientCodeCardDisabled,
          pressed && clientProfileCode?.trim() && styles.pressed,
        ]}
        disabled={!clientProfileCode?.trim()}
      >
        <Text style={[styles.clientCodeLabel, { textTransform: 'none' }]}>
          Код клиента
        </Text>
        <Text style={styles.clientCodeValue} selectable>
          {clientProfileCode?.trim() || "—"}
        </Text>
        <Text style={styles.clientCodeHint}>Нажмите, чтобы скопировать</Text>
      </Pressable>

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

      <ProfileJournalSection
        allEntries={journalEntries}
        onEntryPress={handleOpenJournalEntry}
        onToggleVisibility={handleToggleEntryVisibility}
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
  headerAction: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  pressed: {
    opacity: 0.8,
  },
  clientCodeCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  clientCodeCardDisabled: {
    opacity: 0.55,
    borderColor: colors.subtext,
  },
  clientCodeLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  clientCodeValue: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    letterSpacing: 0.5,
  },
  clientCodeHint: {
    marginTop: 6,
    fontSize: 13,
    color: colors.subtext,
  },
  oaeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  oaeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 10,
  },
  oaeScoreRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  oaeScoreValue: {
    fontSize: 32,
    fontWeight: "700",
    color: colors.text,
  },
  oaeScoreCaption: {
    fontSize: 14,
    color: colors.subtext,
  },
  oaeBreakdown: {
    marginTop: 10,
    gap: 4,
  },
  oaeBreakdownLine: {
    fontSize: 14,
    color: colors.text,
  },
  oaeEmpty: {
    fontSize: 14,
    color: colors.subtext,
  },
});
