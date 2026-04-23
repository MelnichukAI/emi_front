import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { clearAuthSession, getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type UserMeResponse = {
  email?: string | null;
  therapistProfile?: {
    fullName?: string | null;
  } | null;
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
    } catch {
      // keep fallback values
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

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
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Профессиональный код</Text>
        <View style={styles.codeBox}>
          <Text style={styles.codeValue}>{code}</Text>
        </View>
      </View>
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
    minHeight: 96,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
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
});
