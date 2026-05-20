import LogoutIcon from "@/assets/icons/log_out.svg";
import Header from "@/components/common/header";
import ProfilePersonalCard from "@/components/profile/ProfilePersonalCard";
import { colors } from "@/constants/colors";
import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiRequest } from "@/lib/api";
import { clearAuthSession, getAccessToken } from "@/lib/auth-session";

type UserMeResponse = {
  id: string;
  email?: string | null;
  createdAt?: string | null;
  therapistProfile?: {
    fullName?: string | null;
    description?: string | null;
  } | null;
};

type TherapistProfileResponse = {
  fullName?: string | null;
  description?: string | null;
  code?: string | null;
};

type TherapistCodeResponse = {
  code: string;
  fullName?: string | null;
};

function formatMemberSince(value?: string | null): string {
  if (!value) return "неизвестно";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "неизвестно";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export default function TherapistProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("—");
  const [email, setEmail] = useState("—");
  const [memberSince, setMemberSince] = useState("неизвестно");
  const [code, setCode] = useState("—");
  const [aboutText, setAboutText] = useState("");
  const [savedAboutText, setSavedAboutText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [aboutSavedNotice, setAboutSavedNotice] = useState<string | null>(null);

  const [addClientExpanded, setAddClientExpanded] = useState(false);
  const [clientCodeInput, setClientCodeInput] = useState("");
  const [linkingClient, setLinkingClient] = useState(false);

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const [me, myCode] = await Promise.all([
        apiRequest<UserMeResponse>("/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        apiRequest<TherapistCodeResponse>("/therapists/me/code", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setName(me.therapistProfile?.fullName?.trim() || myCode.fullName?.trim() || "—");
      setEmail(me.email?.trim() || "—");
      setMemberSince(formatMemberSince(me.createdAt));
      setCode(myCode.code || "—");

      const description = me.therapistProfile?.description?.trim() ?? "";
      setAboutText(description);
      setSavedAboutText(description);
    } catch {
      // keep fallback values
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const handleSaveAbout = async () => {
    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }
    setSavingAbout(true);
    try {
      const updated = await apiRequest<TherapistProfileResponse>(
        "/therapists/me/profile",
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ description: aboutText }),
        },
      );
      const saved = updated.description?.trim() ?? aboutText.trim();
      setAboutText(saved);
      setSavedAboutText(saved);
      setAboutSavedNotice("Сохранено");
      setTimeout(() => setAboutSavedNotice(null), 2000);
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось сохранить текст.",
      );
    } finally {
      setSavingAbout(false);
    }
  };

  const handleCopyProfessionalCode = async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode || normalizedCode === "—") {
      Alert.alert(
        "Код недоступен",
        "Код терапевта появится после входа или обновления профиля.",
      );
      return;
    }
    try {
      await Clipboard.setStringAsync(normalizedCode);
      if (Platform.OS === "web") {
        window.alert("Код скопирован в буфер обмена.");
        return;
      }
      Alert.alert("Готово", "Код скопирован в буфер обмена.");
    } catch {
      Alert.alert("Ошибка", "Не удалось скопировать код.");
    }
  };

  const handleAddClientByCode = async () => {
    const token = getAccessToken();
    if (!token) {
      Alert.alert("Ошибка", "Сессия не найдена. Войдите снова.");
      return;
    }
    const trimmed = clientCodeInput.trim();
    if (!trimmed) {
      Alert.alert("Код не указан", "Введите код клиента.");
      return;
    }
    try {
      setLinkingClient(true);
      await apiRequest<unknown>("/therapist-clients/by-client-code", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: trimmed }),
      });
      setClientCodeInput("");
      Alert.alert("Готово", "Клиент успешно привязан.");
    } catch (error) {
      Alert.alert(
        "Ошибка",
        error instanceof Error ? error.message : "Не удалось привязать клиента",
      );
    } finally {
      setLinkingClient(false);
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
      { text: "Выйти", style: "destructive", onPress: doLogout },
    ]);
  };

  const aboutDirty = aboutText !== savedAboutText;
  const codeReady = Boolean(code.trim()) && code.trim() !== "—";

  return (
    <ScrollView
      style={profileStyles.screen}
      contentContainerStyle={profileStyles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={profileStyles.headerWrapper}>
        <Header
          title="Профиль"
          titleColor={colors.text}
          titleFontSize={24}
          titleFontWeight="600"
          trailing={
            <Pressable
              style={({ pressed }) => [
                profileStyles.headerAction,
                pressed && styles.pressed,
              ]}
              onPress={handleLogout}
            >
              <LogoutIcon width={24} height={24} color={colors.text} />
            </Pressable>
          }
        />
      </View>

      <ProfilePersonalCard
        user={{
          fullName: name,
          email,
          memberSinceLabel: memberSince,
        }}
        about={{
          value: aboutText,
          onChangeText: setAboutText,
          onSave: () => void handleSaveAbout(),
          saving: savingAbout,
          canSave: aboutDirty,
          savedNotice: aboutSavedNotice,
        }}
      />

      <Pressable
        onPress={() => void handleCopyProfessionalCode()}
        style={({ pressed }) => [
          profileStyles.codeCard,
          !codeReady && profileStyles.codeCardDisabled,
          pressed && codeReady && styles.pressed,
        ]}
        disabled={!codeReady}
      >
        <Text style={profileStyles.codeLabel}>Код терапевта</Text>
        <Text style={profileStyles.codeValue} selectable>
          {codeReady ? code : "—"}
        </Text>
        <Text style={profileStyles.codeHint}>Нажмите, чтобы скопировать</Text>
      </Pressable>

      <View style={profileStyles.card}>
        <Pressable
          onPress={() => setAddClientExpanded((prev) => !prev)}
          style={profileStyles.toggle}
          accessibilityRole="button"
          accessibilityState={{ expanded: addClientExpanded }}
          accessibilityLabel={
            addClientExpanded
              ? "Скрыть форму добавления клиента"
              : "Показать форму добавления клиента"
          }
        >
          <View style={profileStyles.toggleRow}>
            <Text style={profileStyles.blockTitle}>Добавить клиента</Text>
            <Ionicons
              name={addClientExpanded ? "chevron-down" : "chevron-forward"}
              size={20}
              color={colors.primary}
            />
          </View>
        </Pressable>

        {addClientExpanded ? (
          <>
            <TextInput
              value={clientCodeInput}
              onChangeText={setClientCodeInput}
              placeholder="Введите код клиента"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!linkingClient}
              style={profileStyles.input}
            />
            <Pressable
              style={({ pressed }) => [
                profileStyles.linkButton,
                (pressed || linkingClient) && profileStyles.linkButtonPressed,
                linkingClient && profileStyles.linkButtonDisabled,
              ]}
              disabled={linkingClient}
              onPress={() => void handleAddClientByCode()}
            >
              {linkingClient ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={profileStyles.linkButtonText}>Привязать клиента</Text>
              )}
            </Pressable>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 32,
  },
  headerWrapper: {
    marginBottom: 16,
  },
  headerAction: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  blockTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  codeCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  codeCardDisabled: {
    opacity: 0.55,
    borderColor: colors.subtext,
  },
  codeLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  codeValue: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "400",
    color: colors.text,
    letterSpacing: 0.5,
  },
  codeHint: {
    marginTop: 6,
    fontSize: 13,
    color: colors.subtext,
  },
  toggle: {
    marginTop: 2,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  input: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D6DBEA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  linkButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 120,
    alignItems: "center",
  },
  linkButtonDisabled: {
    opacity: 0.5,
  },
  linkButtonPressed: {
    opacity: 0.85,
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
