import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { colors } from "../../constants/colors";

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"client" | "therapist" | null>(null);

  const handleRegister = async () => {
    if (!name || !email || !password || !role) {
      alert("Заполните все поля и выберите роль");
      return;
    }

    const mappedRole = role === "client" ? "ALEXITHYMIC" : "THERAPIST";

    console.log({
      fullName: name,
      email,
      password,
      role: mappedRole,
    });

    try {
      const response = await fetch("http://YOUR_IP:PORT/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: name,
          email,
          password,
          role: mappedRole,
        }),
      });

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok) {
        alert(data.message || "Ошибка регистрации");
        return;
      }

      // 👉 редирект по роли
      if (mappedRole === "ALEXITHYMIC") {
        router.replace("/client");
      } else {
        router.replace("/therapist");
      }
    } catch (error) {
      console.log("REGISTER ERROR:", error);
      alert("Ошибка соединения с сервером");
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
      />

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

      <Pressable
        onPress={handleRegister}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>Зарегистрироваться</Text>
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
});
