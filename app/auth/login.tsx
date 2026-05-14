import { useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import AuthPasswordField from "@/components/common/authPasswordField";
import AuthTextField from "@/components/common/authTextField";
import PrimaryButton from "@/components/common/primaryButton";
import SecondaryButton from "@/components/common/secondaryButton";
import { colors } from "../../constants/colors";
import { textHeading } from "../../constants/typography";
import { apiRequest } from "../../lib/api";
import { saveAuthSession } from "../../lib/auth-session";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  therapistCode: string | null;
  clientCode: string | null;
};

export default function Login() {
  const router = useRouter();

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
    <View style={styles.container}>
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

      <SecondaryButton
        title="Нет аккаунта?"
        subtitle="Зарегистрироваться"
        onPress={() => router.push("/auth")}
        flushHorizontal
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
