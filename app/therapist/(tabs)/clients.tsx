import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { getAccessToken } from "../../../lib/auth-session";
import { apiRequest } from "../../../lib/api";

type TherapistClientLink = {
  id: string;
  alexithymicId: string;
  status: "ACTIVE" | "PAUSED" | "FINISHED";
  startDate: string;
  clientName?: string | null;
  clientEmail?: string | null;
};

export default function TherapistClientsScreen() {
  const [links, setLinks] = useState<TherapistClientLink[]>([]);
  const statusLabel: Record<TherapistClientLink["status"], string> = {
    ACTIVE: "Активен",
    PAUSED: "Пауза",
    FINISHED: "Завершен",
  };

  const load = useCallback(async () => {
    const token = getAccessToken();
    if (!token) return;
    try {
      const data = await apiRequest<TherapistClientLink[]>("/client-therapist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLinks(data.filter((item) => Boolean(item.alexithymicId)));
    } catch {
      setLinks([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Клиенты</Text>
      <Text style={styles.subtitle}>Подключенные клиенты</Text>

      {links.map((link) => (
        <View key={link.id} style={styles.card}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(link.clientName?.trim().slice(0, 2) || "КЛ").toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.clientId}>
              {link.clientName?.trim() || "Клиент"}
            </Text>
            <Text style={styles.meta}>{link.clientEmail || "Email не указан"}</Text>
            <Text style={styles.meta}>Статус: {statusLabel[link.status]}</Text>
            <Text style={styles.meta}>
              Начало: {new Date(link.startDate).toLocaleDateString("ru-RU")}
            </Text>
          </View>
        </View>
      ))}

      {links.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>Пока нет привязанных клиентов.</Text>
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
  title: {
    fontSize: 16,
    color: "#2E4B89",
    fontWeight: "700",
  },
  subtitle: {
    color: "#7D8DB5",
    fontSize: 11,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 12,
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#5C7EEB",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "white",
    fontWeight: "700",
    fontSize: 13,
  },
  clientId: {
    color: "#2E4B89",
    fontWeight: "700",
  },
  meta: {
    marginTop: 2,
    color: "#7D8DB5",
    fontSize: 11,
  },
  emptyCard: {
    backgroundColor: "#F5F1E8",
    borderRadius: 12,
    padding: 16,
  },
  emptyText: {
    color: "#7D8DB5",
  },
});
