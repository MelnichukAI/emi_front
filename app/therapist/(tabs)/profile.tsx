import { colors } from "@/constants/colors";
import { therapistTabScreenStyles as styles } from "@/lib/therapist-tab-screen-styles";
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
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { apiRequest } from "../../../lib/api";
import { clearAuthSession, getAccessToken } from "../../../lib/auth-session";
import { screenTopPadding } from "../../../lib/screen-top-padding";

type UserMeResponse = {
  id: string;
  email?: string | null;
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

export default function TherapistProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState("—");
  const [email, setEmail] = useState("—");
  const [code, setCode] = useState("—");
  const [aboutText, setAboutText] = useState("");
  const [savedAboutText, setSavedAboutText] = useState("");
  const [savingAbout, setSavingAbout] = useState(false);
  const [aboutSavedNotice, setAboutSavedNotice] = useState<string | null>(null);

  const [showAddClient, setShowAddClient] = useState(false);
  const [clientCodeInput, setClientCodeInput] = useState("");
  const [linkingClient, setLinkingClient] = useState(false);
  const [copyNotice, setCopyNotice] = useState<string | null>(null);

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

  const handleShareCode = async () => {
    const normalizedCode = code.trim();
    if (!normalizedCode || normalizedCode === "—") return;

    try {
      await Clipboard.setStringAsync(normalizedCode);
      setCopyNotice("Код скопирован");
      setTimeout(() => setCopyNotice(null), 1600);
    } catch {
      setCopyNotice("Не удалось скопировать код");
      setTimeout(() => setCopyNotice(null), 1800);
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
      setShowAddClient(false);
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
        <View style={styles.topRow}>
          <View style={styles.topLeft}>
            <Text style={styles.title}>Профиль</Text>
            <Text style={styles.subtitle}>Управление аккаунтом</Text>
          </View>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.pressed]}
          >
            <Text style={styles.logoutText}>Выйти</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar}>
              <Text style={styles.profileAvatarIcon}>◌</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{name}</Text>
              <Text style={styles.profileEmail}>{email}</Text>
            </View>
          </View>

          <Text style={styles.fieldLabel}>Расскажите о себе</Text>
          <TextInput
            value={aboutText}
            onChangeText={setAboutText}
            placeholder="Например: специализация, подход к работе, опыт…"
            placeholderTextColor={colors.subtext}
            multiline
            textAlignVertical="top"
            style={styles.textInput}
          />
          <Pressable
            style={({ pressed }) => [
              styles.primaryBtn,
              (!aboutDirty || savingAbout) && styles.primaryBtnDisabled,
              pressed && aboutDirty && styles.pressed,
            ]}
            disabled={!aboutDirty || savingAbout}
            onPress={() => void handleSaveAbout()}
          >
            {savingAbout ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.primaryBtnText}>Сохранить</Text>
            )}
          </Pressable>
          {aboutSavedNotice ? (
            <Text style={styles.successNotice}>{aboutSavedNotice}</Text>
          ) : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Профессиональный код</Text>
          <View style={styles.codeBox}>
            <Text style={styles.codeValue} selectable>
              {code}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              styles.actionCardPrimary,
              pressed && styles.pressed,
            ]}
            onPress={() => setShowAddClient((prev) => !prev)}
          >
            <Text style={[styles.actionIcon, styles.actionIconOnPrimary]}>☼</Text>
            <Text style={styles.actionTextOnPrimary}>
              {showAddClient ? "Скрыть форму" : "Добавить клиента"}
            </Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.actionCard,
              pressed && styles.pressed,
            ]}
            onPress={() => void handleShareCode()}
          >
            <Text style={styles.actionIcon}>↗</Text>
            <Text style={styles.actionText}>Поделиться кодом</Text>
          </Pressable>
        </View>

        {copyNotice ? (
          <Text style={styles.inlineNotice}>{copyNotice}</Text>
        ) : null}

        {showAddClient ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Код клиента</Text>
            <Text style={styles.hint}>
              Вставьте код из профиля клиента (формат C-…).
            </Text>
            <TextInput
              value={clientCodeInput}
              onChangeText={setClientCodeInput}
              placeholder="C-c05c0f79"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!linkingClient}
              style={styles.textInputSingle}
            />
            <Pressable
              style={({ pressed }) => [
                styles.submitBtn,
                (pressed || linkingClient) && styles.pressed,
                linkingClient && styles.submitBtnDisabled,
              ]}
              disabled={linkingClient}
              onPress={() => void handleAddClientByCode()}
            >
              {linkingClient ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Привязать клиента</Text>
              )}
            </Pressable>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
