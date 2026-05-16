import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthPasswordField from "@/components/common/authPasswordField";
import AuthTextField from "@/components/common/authTextField";
import AuthFormNavLink from "@/components/common/authFormNavLink";
import PrimaryButton from "@/components/common/primaryButton";
import { colors } from "../../constants/colors";
import { textHeading } from "../../constants/typography";
import { apiRequest } from "../../lib/api";
import { saveAuthSession } from "../../lib/auth-session";
import { screenTopPadding } from "../../lib/screen-top-padding";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  therapistCode: string | null;
  clientCode: string | null;
};

export default function Login() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Введите email и пароль");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        therapistCode: data.therapistCode,
        clientCode: data.clientCode,
      });

      const isClient = !data.therapistCode;
      if (isClient) {
        router.replace("/client");
      } else {
        router.replace("/therapist");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: screenTopPadding(insets.top) }]}>
      <Text style={styles.title}>Вход</Text>

      <AuthTextField
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
      />

      <AuthPasswordField
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        textContentType="password"
        autoComplete="password"
      />

      <PrimaryButton
        title={loading ? "Вход..." : "Войти"}
        onPress={() => void handleLogin()}
        disabled={loading}
        flushHorizontal
        titleFontWeight="500"
      />

      <AuthFormNavLink
        question="Нет аккаунта?"
        action="Зарегистрироваться"
        onPress={() => router.push("/auth")}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    justifyContent: "center",
  },

  title: {
    ...textHeading,
    fontSize: 24,
    marginBottom: 30,
    color: colors.text,
    textAlign: "center",
  },
});
