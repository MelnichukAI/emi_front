import { authFieldInput, authFieldShell } from "@/constants/authFormField";
import { colors } from "@/constants/colors";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

export type AuthTextFieldProps = TextInputProps & {
  marginBottom?: number;
};

/**
 * Однострочное поле для форм входа и регистрации — единый фон и скругление через оболочку
 * (как у поля пароля), чтобы визуально совпадало на всех платформах.
 */
export default function AuthTextField({
  marginBottom = 12,
  style,
  placeholderTextColor,
  ...rest
}: AuthTextFieldProps) {
  return (
    <View style={[styles.wrap, { marginBottom }]}>
      <TextInput
        placeholderTextColor={placeholderTextColor ?? colors.subtext}
        style={[authFieldInput, style]}
        underlineColorAndroid="transparent"
        {...rest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    ...authFieldShell,
  },
});
