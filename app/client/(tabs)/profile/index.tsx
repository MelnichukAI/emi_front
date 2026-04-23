import ProfileJournalSection from "@/components/profile/ProfileJournalSection";
import ProfilePersonalCard from "@/components/profile/ProfilePersonalCard";
import ProfileTherapistCard from "@/components/profile/ProfileTherapistCard";
import { colors } from "@/constants/colors";
import { entries } from "@/data/mockData";
import { mockProfileTherapist, mockProfileUser } from "@/data/mockProfile";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function ProfileScreen() {
  const router = useRouter();

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerActions}>
        <Pressable
          style={({ pressed }) => [styles.headerBtn, pressed && styles.pressed]}
          onPress={() => router.push("/client/profile/oae")}
        >
          <Text style={styles.headerBtnText}>ОАЭ</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.headerBtn,
            styles.headerBtnPrimary,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/client/profile/settings")}
        >
          <Text style={styles.headerBtnTextPrimary}>Настройки</Text>
        </Pressable>
      </View>

      <Text style={styles.pageTitle}>Профиль</Text>
      <Text style={styles.pageSubtitle}>
        Данные ниже — демо, позже подтянем с сервера.
      </Text>

      <ProfilePersonalCard user={mockProfileUser} />
      <ProfileTherapistCard therapist={mockProfileTherapist} />

      <ProfileJournalSection entries={entries} />
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
  headerActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingTop: 56,
    paddingHorizontal: 16,
    gap: 10,
  },
  headerBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  headerBtnPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  headerBtnText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },
  headerBtnTextPrimary: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.text,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.subtext,
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 8,
    lineHeight: 20,
  },
});
