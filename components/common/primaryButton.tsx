import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  type TextStyle,
} from "react-native";
import { colors } from "../../constants/colors";
import { FONT_FAMILIES, textBody } from "../../constants/typography";
type Props = {
  title: string;
  onPress?: () => void;
  icon?: ReactNode;
  disabled?: boolean;
  /** Убрать marginHorizontal (форма уже с padding) */
  flushHorizontal?: boolean;
  /** По умолчанию 600; на формах входа/регистрации удобно «500» (Roboto Medium) */
  titleFontWeight?: TextStyle["fontWeight"];
};
export default function PrimaryButton({
  title,
  onPress,
  icon,
  disabled,
  flushHorizontal,
  titleFontWeight = "600",
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        flushHorizontal && styles.flushHorizontal,
        disabled && styles.buttonDisabled,
      ]}
      onPress={disabled ? undefined : onPress}
      activeOpacity={0.88}
      disabled={disabled}
    >
      <View style={styles.inner}>
        {icon ? <View style={styles.iconSlot}>{icon}</View> : null}
        <Text
          style={[
            styles.text,
            titleFontWeight === "500"
              ? { fontFamily: FONT_FAMILIES.medium, fontWeight: "500" }
              : { fontWeight: titleFontWeight },
          ]}
        >
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 18,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 16,
  },
  flushHorizontal: {
    marginHorizontal: 0,
  },
  buttonDisabled: {
    opacity: 0.55,
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
    color: "#fff",
    fontSize: 17,
  },
});