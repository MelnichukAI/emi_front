import { colors } from "@/constants/colors";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  user: {
    fullName: string;
    email: string;
    roleLabel: string;
    memberSinceLabel: string;
  };
};

export default function ProfilePersonalCard({ user }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.blockTitle}>Персональные данные</Text>
      <View style={styles.info}>
        <Text style={styles.name}>{user.fullName}</Text>
        <Text style={styles.line}>{user.email}</Text>
        <Text style={styles.line}>Роль: {user.roleLabel}</Text>
        <Text style={styles.lineMuted}>В приложении с {user.memberSinceLabel}</Text>
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
