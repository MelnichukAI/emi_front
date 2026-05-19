import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  therapistCode: string;
  onChangeTherapistCode: (value: string) => void;
  onLinkTherapist: () => void;
  onUnlinkTherapist: () => void;
  linking: boolean;
  unlinking: boolean;
  linkedTherapistName?: string;
  linkedTherapistCode?: string;
  hasLinkedTherapist: boolean;
};

export default function ProfileTherapistCard({
  therapistCode,
  onChangeTherapistCode,
  onLinkTherapist,
  onUnlinkTherapist,
  linking,
  unlinking,
  linkedTherapistName,
  linkedTherapistCode,
  hasLinkedTherapist,
}: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <Pressable
        onPress={() => setExpanded((prev) => !prev)}
        style={styles.toggle}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        accessibilityLabel={expanded ? "Скрыть блок терапевта" : "Показать блок терапевта"}
      >
        <View style={styles.toggleRow}>
          <Text style={styles.blockTitle}>Терапевт</Text>
          <Ionicons
            name={expanded ? "chevron-down" : "chevron-forward"}
            size={20}
            color={colors.primary}
          />
        </View>
      </Pressable>

      {expanded ? (
        <>
          {hasLinkedTherapist ? (
            <>
              <Text style={styles.linkedName}>
                {linkedTherapistName || "Терапевт привязан"}
              </Text>
              {linkedTherapistCode ? (
                <Text style={styles.linkedCode}>Код: {linkedTherapistCode}</Text>
              ) : null}

              <Pressable
                onPress={onUnlinkTherapist}
                disabled={unlinking}
                style={({ pressed }) => [
                  styles.unlinkButton,
                  (pressed || unlinking) && styles.linkButtonPressed,
                ]}
              >
                <Text style={styles.linkButtonText}>
                  {unlinking ? "Отвязка..." : "Отвязать терапевта"}
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              <TextInput
                value={therapistCode}
                onChangeText={onChangeTherapistCode}
                placeholder="Введите код терапевта"
                placeholderTextColor={colors.subtext}
                autoCapitalize="none"
                style={styles.input}
              />

              <Pressable
                onPress={onLinkTherapist}
                disabled={linking}
                style={({ pressed }) => [
                  styles.linkButton,
                  (pressed || linking) && styles.linkButtonPressed,
                ]}
              >
                <Text style={styles.linkButtonText}>
                  {linking ? "Привязка..." : "Привязать терапевта"}
                </Text>
              </Pressable>
            </>
          )}
        </>
      ) : null}
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
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  toggle: {
    marginTop: 2,
    marginBottom: 4,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 2,
  },
  input: {
    marginTop: 10,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D6DBEA",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  linkButton: {
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  unlinkButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkButtonPressed: {
    opacity: 0.85,
  },
  linkButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  linkedName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
  },
  linkedCode: {
    marginTop: 4,
    fontSize: 14,
    color: colors.subtext,
  },
});
