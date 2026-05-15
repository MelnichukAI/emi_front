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
import { apiRequest } from "../../../lib/api";
import { clearAuthSession, getAccessToken } from "../../../lib/auth-session";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
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

      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>◌</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.email}>{email}</Text>
          </View>
        </View>

        <Text style={styles.aboutLabel}>Расскажите о себе</Text>
        <TextInput
          value={aboutText}
          onChangeText={setAboutText}
          placeholder="Например: специализация, подход к работе, опыт…"
          placeholderTextColor="#9CA6C7"
          multiline
          textAlignVertical="top"
          style={styles.aboutInput}
        />
        <Pressable
          style={({ pressed }) => [
            styles.saveAboutBtn,
            (!aboutDirty || savingAbout) && styles.saveAboutBtnDisabled,
            pressed && aboutDirty && styles.pressed,
          ]}
          disabled={!aboutDirty || savingAbout}
          onPress={() => void handleSaveAbout()}
        >
          {savingAbout ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.saveAboutBtnText}>Сохранить</Text>
          )}
        </Pressable>
        {aboutSavedNotice ? (
          <Text style={styles.aboutSavedNotice}>{aboutSavedNotice}</Text>
        ) : null}
        
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Профессиональный код</Text>
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
            styles.actionPrimary,
            pressed && styles.pressed,
          ]}
          onPress={() => setShowAddClient((prev) => !prev)}
        >
          <Text style={styles.actionIcon}>☼</Text>
          <Text style={styles.actionPrimaryText}>
            {showAddClient ? "Скрыть форму" : "Добавить клиента"}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.actionCard, pressed && styles.pressed]}
          onPress={() => void handleShareCode()}
        >
          <Text style={styles.actionIcon}>↗</Text>
          <Text style={styles.actionText}>Поделиться кодом</Text>
        </Pressable>
      </View>

      {copyNotice ? <Text style={styles.inlineNotice}>{copyNotice}</Text> : null}

      {showAddClient ? (
        <View style={styles.addClientCard}>
          <Text style={styles.addClientTitle}>Код клиента</Text>
          <Text style={styles.addClientHint}>
            Вставьте код из профиля клиента (формат C-…).
          </Text>
          <TextInput
            value={clientCodeInput}
            onChangeText={setClientCodeInput}
            placeholder="C-c05c0f79"
            placeholderTextColor="#9CA6C7"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!linkingClient}
            style={styles.addClientInput}
          />
          <Pressable
            style={({ pressed }) => [
              styles.addClientSubmit,
              (pressed || linkingClient) && styles.pressed,
              linkingClient && styles.addClientSubmitDisabled,
            ]}
            disabled={linkingClient}
            onPress={() => void handleAddClientByCode()}
          >
            {linkingClient ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addClientSubmitText}>Привязать клиента</Text>
            )}
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#CBD4E7",
  },
  content: {
    paddingHorizontal: 12,
    paddingTop: 28,
    paddingBottom: 24,
    gap: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
  },
  topLeft: {
    flex: 1,
  },
  title: {
    fontSize: 28 / 2,
    color: "#2E4B89",
    fontWeight: "700",
  },
  subtitle: {
    color: "#7D8DB5",
    fontSize: 11,
  },
  logoutBtn: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#E35D5D",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
  },
  pressed: {
    opacity: 0.85,
  },
  profileCard: {
    marginTop: 6,
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 4,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#5C7EEB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: {
    color: "white",
    fontSize: 18,
  },
  name: {
    color: "#2E4B89",
    fontWeight: "700",
    fontSize: 16,
  },
  email: {
    color: "#92A1C6",
    fontSize: 11,
  },
  aboutLabel: {
    color: "#2E4B89",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 4,
  },
  aboutInput: {
    minHeight: 100,
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9DFEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#2E4B89",
    lineHeight: 20,
  },
  saveAboutBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#5C7EEB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    minWidth: 120,
    alignItems: "center",
  },
  saveAboutBtnDisabled: {
    opacity: 0.5,
  },
  saveAboutBtnText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  aboutSavedNotice: {
    color: "#0EA54F",
    fontSize: 12,
    fontWeight: "600",
  },
  aboutHint: {
    color: "#7D8DB5",
    fontSize: 11,
    lineHeight: 15,
  },
  codeCard: {
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
  },
  codeLabel: {
    color: "#2E4B89",
    fontWeight: "600",
    marginBottom: 10,
  },
  codeBox: {
    backgroundColor: "#F2E7A8",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  codeValue: {
    color: "#4A5685",
    fontSize: 22 / 2,
    letterSpacing: 1,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    gap: 8,
  },
  actionCard: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#F5F1E8",
    padding: 12,
    gap: 6,
  },
  actionPrimary: {
    backgroundColor: "#5C7EEB",
  },
  actionIcon: {
    fontSize: 18,
    color: "#2E4B89",
  },
  actionText: {
    color: "#2E4B89",
    fontWeight: "600",
    fontSize: 13,
  },
  actionPrimaryText: {
    color: "white",
    fontWeight: "600",
    fontSize: 13,
  },
  inlineNotice: {
    textAlign: "center",
    color: "#5C7EEB",
    fontSize: 12,
    fontWeight: "600",
  },
  addClientCard: {
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8D7AD",
  },
  addClientTitle: {
    color: "#2E4B89",
    fontWeight: "700",
    fontSize: 15,
  },
  addClientHint: {
    color: "#7D8DB5",
    fontSize: 12,
    lineHeight: 16,
  },
  addClientInput: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D9DFEF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#2E4B89",
  },
  addClientSubmit: {
    marginTop: 4,
    backgroundColor: "#5C7EEB",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  addClientSubmitDisabled: {
    opacity: 0.75,
  },
  addClientSubmitText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
