import { authFieldInput, authFieldShell } from "@/constants/authFormField";
import { colors } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

export type AuthPasswordFieldProps = Omit<
  TextInputProps,
  "secureTextEntry" | "style"
> & {
  marginBottom?: number;
  style?: TextInputProps["style"];
  accessibilityLabelWhenHidden?: string;
  accessibilityLabelWhenVisible?: string;
};

/**
 * Поле пароля с кнопкой показа/скрытия — та же оболочка и скругление, что у AuthTextField.
 */
export default function AuthPasswordField({
  marginBottom = 12,
  style,
  placeholderTextColor,
  accessibilityLabelWhenHidden = "Показать пароль",
  accessibilityLabelWhenVisible = "Скрыть пароль",
  ...rest
}: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[authFieldShell, styles.row, { marginBottom }]}>
      <TextInput
        {...rest}
        secureTextEntry={!visible}
        placeholderTextColor={placeholderTextColor ?? colors.subtext}
        underlineColorAndroid="transparent"
        style={[authFieldInput, styles.inputFlex, style]}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={({ pressed }) => [styles.eyeBtn, pressed && styles.eyeBtnPressed]}
        accessibilityLabel={visible ? accessibilityLabelWhenVisible : accessibilityLabelWhenHidden}
        hitSlop={8}
      >
        <Ionicons
          name={visible ? "eye-off-outline" : "eye-outline"}
          size={22}
          color={colors.primary}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 4,
  },
  inputFlex: {
    flex: 1,
    minWidth: 0,
  },
  eyeBtn: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeBtnPressed: {
    opacity: 0.7,
  },
});
