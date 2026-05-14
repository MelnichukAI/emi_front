import { ReactNode } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";
import { textBody, textMedium } from "../../constants/typography";
type Props = {
  title: string;
  /** Вторая строка (например действие на экранах входа/регистрации) */
  subtitle?: string;
  onPress?: () => void;
  icon?: ReactNode;
  flushHorizontal?: boolean;
};

export default function SecondaryButton({
  title,
  subtitle,
  onPress,
  icon,
  flushHorizontal,
}: Props) {
  const twoLine = Boolean(subtitle?.trim());

  return (
    <TouchableOpacity
      style={[
        styles.button,
        flushHorizontal && styles.flushHorizontal,
        twoLine && styles.buttonTwoLine,
      ]}
      onPress={onPress}
      activeOpacity={0.88}
    >
      {twoLine ? (
        <View style={styles.column}>
          <Text style={styles.questionLine}>{title}</Text>
          <Text style={styles.actionLine}>{subtitle}</Text>
        </View>
      ) : (
        <View style={styles.inner}>
          {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
          <Text style={styles.text}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.surface,
    paddingVertical: 18,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "rgba(75, 69, 150, 0.22)",
  },
  flushHorizontal: {
    marginHorizontal: 0,
  },
  buttonTwoLine: {
    paddingVertical: 14,
  },
  column: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  questionLine: {
    ...textMedium,
    fontSize: 14,
    color: colors.subtext,
    textAlign: "center",
  },
  actionLine: {
    ...textMedium,
    fontSize: 17,
    color: colors.text,
    textAlign: "center",
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  iconSlot: {
    marginRight: -2,
  },
  text: {
    ...textBody,
    color: colors.primary,
    fontSize: 17,
    fontWeight: "600",
  },
});
