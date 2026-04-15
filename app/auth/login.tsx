import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      alert("Введите email и пароль");
      return;
    }

    // 🔥 временная логика (мок)
    const isClient = email.includes("client");

    if (isClient) {
      router.replace("/client");
    } else {
      router.replace("/therapist");
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
        onPress={handleLogin}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Войти</Text>
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
