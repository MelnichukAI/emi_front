import { colors } from "@/constants/colors";
import type { ProfileUserMock } from "@/data/mockProfile";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  user: ProfileUserMock;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfilePersonalCard({ user }: Props) {
  const mark = initials(user.fullName);

  return (
    <View style={styles.card}>
      <Text style={styles.blockTitle}>Персональные данные</Text>

      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{mark}</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.line}>{user.email}</Text>
          <Text style={styles.line}>Роль: {user.roleLabel}</Text>
          <Text style={styles.lineMuted}>
            В приложении с {user.memberSinceLabel}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.card,
  },
  blockTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 6,
  },
  line: {
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  lineMuted: {
    fontSize: 14,
    color: colors.subtext,
    marginTop: 4,
  },
});
