import { authFieldInput, authFieldShell } from "@/constants/authFormField";
import { colors } from "@/constants/colors";
import { StyleSheet, TextInput, View, type TextInputProps } from "react-native";

type Props = Omit<TextInputProps, "value" | "onChangeText"> & {
  value: string;
  onChangeText: (value: string) => void;
  marginBottom?: number;
};

/** Поле для 6-значного кода из письма. */
export default function AuthCodeField({
  value,
  onChangeText,
  marginBottom = 12,
  style,
  ...rest
}: Props) {
  return (
    <View style={[styles.wrap, { marginBottom }]}>
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.replace(/\D/g, "").slice(0, 6))}
        placeholder="000000"
        placeholderTextColor={colors.subtext}
        keyboardType="number-pad"
        maxLength={6}
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        style={[authFieldInput, styles.code, style]}
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
  code: {
    textAlign: "center",
    letterSpacing: 8,
    fontSize: 22,
    fontWeight: "600",
  },
});
