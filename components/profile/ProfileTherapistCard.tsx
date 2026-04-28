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
  linkedCount: number;
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
  linkedCount,
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
        <View style={styles.toggleLine} />
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
            <View style={styles.linkedBox}>
              <Text style={styles.linkedTitle}>Подключенный терапевт</Text>
              <Text style={styles.linkedName}>
                {linkedTherapistName || "Терапевт привязан"}
              </Text>
              {linkedTherapistCode ? (
                <Text style={styles.linkedCode}>Код: {linkedTherapistCode}</Text>
              ) : null}
            </View>
          ) : null}

          {hasLinkedTherapist ? (
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
          ) : (
            <>
              <Text style={styles.lineMuted}>
                Введите код терапевта для привязки (пример: T-c05c0f79)
              </Text>

              <TextInput
                value={therapistCode}
                onChangeText={onChangeTherapistCode}
                placeholder="T-c05c0f79"
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

          <Text style={styles.lineMuted}>
            Активных привязок: {linkedCount}
          </Text>
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
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
  toggle: {
    marginTop: 2,
    marginBottom: 4,
  },
  toggleLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.subtext,
    opacity: 0.45,
    marginBottom: 10,
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
    marginTop: 10,
    alignSelf: "flex-start",
    backgroundColor: "#E35D5D",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  linkButtonPressed: {
    opacity: 0.85,
  },
  linkButtonText: {
    color: "#fff",
    fontWeight: "700",
  },
  lineMuted: {
    fontSize: 14,
    color: colors.subtext,
    lineHeight: 20,
    marginTop: 8,
  },
  linkedBox: {
    marginTop: 2,
    marginBottom: 4,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#F7F8FD",
    borderWidth: 1,
    borderColor: "#D9DFEF",
  },
  linkedTitle: {
    color: colors.subtext,
    fontSize: 12,
  },
  linkedName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  linkedCode: {
    color: colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
});
