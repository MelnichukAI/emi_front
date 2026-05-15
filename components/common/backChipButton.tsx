import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  type PressableProps,
} from "react-native";

export type BackChipButtonProps = {
  onPress: () => void;
  /** Подпись рядом со стрелкой (по умолчанию «Назад»). */
  title?: string;
  accessibilityLabel?: string;
  hitSlop?: number;
  disabled?: boolean;
  testID?: string;
  style?: PressableProps["style"];
};

/**
 * Чип «Назад» с chevron и подписью (как на экране подтверждения записи).
 */
export default function BackChipButton({
  onPress,
  title = "Назад",
  accessibilityLabel = title,
  hitSlop = 8,
  disabled = false,
  testID,
  style,
}: BackChipButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={hitSlop}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      style={({ pressed }) => [
        styles.chip,
        pressed && !disabled && styles.chipPressed,
        disabled && styles.chipDisabled,
        style,
      ]}
    >
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Ionicons name="chevron-back" size={22} color={colors.surface} />
        </View>
        <Text style={styles.label}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignSelf: "flex-start",
    minWidth: 96,
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  chipPressed: {
    opacity: 0.88,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  inner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  iconWrap: {
    width: 22,
    height: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "600",
    color: colors.surface,
    ...Platform.select({
      android: { includeFontPadding: false, textAlignVertical: "center" },
      default: {},
    }),
  },
});
