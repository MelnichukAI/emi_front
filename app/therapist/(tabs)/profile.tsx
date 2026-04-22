import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type UserMeResponse = {
  email?: string | null;
  therapistProfile?: {
    fullName?: string | null;
    description?: string | null;
  } | null;
};

type TherapistCodeResponse = {
  code: string;
  fullName?: string | null;
};

export default function TherapistProfileScreen() {
  const [name, setName] = useState("Dr. Emily Carter");
  const [email, setEmail] = useState("emi.carter@therapy.com");
  const [specialization, setSpecialization] = useState("Cognitive Behavioral Therapy");
  const [code, setCode] = useState("THR-0000-0000");

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

      setName(me.therapistProfile?.fullName?.trim() || myCode.fullName?.trim() || "Therapist");
      setEmail(me.email?.trim() || "No email");
      setSpecialization(
        me.therapistProfile?.description?.trim() || "Cognitive Behavioral Therapy"
      );
      setCode(myCode.code || "THR-0000-0000");
    } catch {
      // keep fallback values
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Manage your account</Text>

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

        <View style={styles.specCard}>
          <Text style={styles.specLabel}>Specialization</Text>
          <Text style={styles.specValue}>{specialization}</Text>
        </View>
      </View>

      <View style={styles.codeCard}>
        <Text style={styles.codeLabel}>Professional Code</Text>
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
  title: {
    fontSize: 28 / 2,
    color: "#2E4B89",
    fontWeight: "700",
  },
  subtitle: {
    color: "#7D8DB5",
    fontSize: 11,
  },
  profileCard: {
    marginTop: 6,
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
    minHeight: 220,
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
  specCard: {
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#E8D7AD",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: "#F6F3EA",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  specLabel: {
    color: "#92A1C6",
    fontSize: 10,
  },
  specValue: {
    color: "#2E4B89",
    fontSize: 12,
    marginTop: 2,
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
