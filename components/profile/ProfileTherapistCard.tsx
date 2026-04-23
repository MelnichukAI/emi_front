import { colors } from "@/constants/colors";
import type { ProfileTherapistMock } from "@/data/mockProfile";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  therapist: ProfileTherapistMock;
};

export default function ProfileTherapistCard({ therapist }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.blockTitle}>Терапевт</Text>

      <Text style={styles.name}>{therapist.fullName}</Text>
      <Text style={styles.lineMuted}>
        Подключён в приложении с {therapist.linkedSinceLabel}
      </Text>
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
    marginBottom: 10,
  },
  name: {
    fontSize: 17,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  lineMuted: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
  },
});
