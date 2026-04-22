import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";
import { apiRequest } from "../../lib/api";
import { saveAuthSession } from "../../lib/auth-session";

type RegisterResponse = {
  id: string;
  email: string;
  role: "ALEXITHYMIC" | "THERAPIST" | "ADMIN";
  therapistCode: string | null;
  accessToken: string;
  refreshToken: string;
};

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "therapist" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      alert("Заполните все поля и выберите роль");
      return;
    }

    const mappedRole = role === "client" ? "ALEXITHYMIC" : "THERAPIST";

    if (password.length < 8) {
      alert("Пароль должен быть не короче 8 символов ");
      return;
    }

    try {
      setLoading(true);
      const data = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name.trim(),
          email: email.trim(),
          password,
          role: mappedRole,
        }),
      });

      saveAuthSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });

      if (mappedRole === "ALEXITHYMIC") {
        router.replace("/client");
      } else {
        router.replace("/therapist");
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Ошибка соединения с сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Регистрация</Text>

      <TextInput
        placeholder="Имя"
        value={name}
        onChangeText={setName}
        style={styles.input}
        placeholderTextColor={colors.subtext}
      />

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
        placeholderTextColor={colors.subtext}
      />

      <TextInput
        placeholder="Пароль"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
        placeholderTextColor={colors.subtext}
      />

      {/* Выбор роли */}
      <View style={styles.roleContainer}>
        <Pressable
          onPress={() => setRole("client")}
          style={[styles.roleButton, role === "client" && styles.roleActive]}
        >
          <Text
            style={[
              styles.roleText,
              role === "client" && styles.roleTextActive,
            ]}
          >
            Клиент
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setRole("therapist")}
          style={[styles.roleButton, role === "therapist" && styles.roleActive]}
        >
          <Text
            style={[
              styles.roleText,
              role === "therapist" && styles.roleTextActive,
            ]}
          >
            Психолог
          </Text>
        </Pressable>
      </View>

      <Pressable onPress={() => router.push("/legal/user-agreement")}>
        <Text style={styles.agreementLink}>
          Продолжая, вы принимаете Пользовательское соглашение
        </Text>
      </Pressable>

      <Pressable
        disabled={loading}
        onPress={handleRegister}
        style={({ pressed }) => [
          styles.button,
          (pressed || loading) && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>
          {loading ? "Регистрация..." : "Зарегистрироваться"}
        </Text>
      </Pressable>

      <Pressable onPress={() => router.push("/auth/login")}>
        <Text style={styles.link}>Уже есть аккаунт? Войти</Text>
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
    color: colors.text,
  },

  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    alignItems: "center",
  },

  roleActive: {
    backgroundColor: colors.primary,
  },

  roleText: {
    color: colors.primary,
  },

  roleTextActive: {
    color: "#fff",
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
  agreementLink: {
    marginBottom: 14,
    textAlign: "center",
    color: colors.primary,
    textDecorationLine: "underline",
  },
});
