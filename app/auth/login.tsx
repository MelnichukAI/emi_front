import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";
import { apiRequest } from "../../lib/api";
import { saveAuthSession } from "../../lib/auth-session";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  therapistCode: string | null;
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

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <Pressable
        disabled={loading}
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          (pressed || loading) && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>{loading ? "Вход..." : "Войти"}</Text>
      </Pressable>

      <Pressable onPress={() => router.push("/auth")}>
        <Text style={styles.link}>Нет аккаунта? Регистрация</Text>
      </Pressable>
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
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 30,
    color: colors.text,
    textAlign: "center",
  },

  input: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  button: {
    backgroundColor: colors.primary,
    padding: 14,
    borderRadius: 20,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: colors.primary,
  },
});
