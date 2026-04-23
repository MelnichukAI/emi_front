import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileSettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>Назад</Text>
        </Pressable>
      </View>

      <Text style={styles.title}>Настройки</Text>
      <Text style={styles.lead}>
        Здесь позже появятся параметры аккаунта, уведомления и приватность.
      </Text>

      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Раздел (заглушка)</Text>
        <Text style={styles.placeholderText}>
          Уведомления — в разработке
        </Text>
      </View>

      <View style={styles.placeholderCard}>
        <Text style={styles.placeholderTitle}>Раздел (заглушка)</Text>
        <Text style={styles.placeholderText}>Тема оформления — в разработке</Text>
      </View>

      <View style={styles.qrSection}>
        <Text style={styles.qrTitle}>Персональный QR-код</Text>
        <Text style={styles.qrHint}>
          Позже здесь будет ваш код для быстрого подключения к терапевту.
        </Text>
        <View style={styles.qrBox}>
          <Text style={styles.qrPlaceholder}>QR</Text>
        </View>
      </View>
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
    paddingHorizontal: 20,
  },
  topBar: {
    paddingTop: 56,
    paddingBottom: 8,
  },
  back: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primary,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 8,
  },
  lead: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
    marginBottom: 20,
  },
  placeholderCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.subtext,
  },
  qrSection: {
    marginTop: 8,
  },
  qrTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  qrHint: {
    fontSize: 13,
    color: colors.subtext,
    lineHeight: 18,
    marginBottom: 14,
  },
  qrBox: {
    aspectRatio: 1,
    maxWidth: 220,
    alignSelf: "center",
    width: "100%",
    borderRadius: 16,
    backgroundColor: colors.card,
    borderWidth: 2,
    borderColor: colors.subtext,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  qrPlaceholder: {
    fontSize: 28,
    fontWeight: "700",
    color: colors.subtext,
    letterSpacing: 4,
  },
});
