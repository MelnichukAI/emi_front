import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AuthPasswordField from "@/components/common/authPasswordField";
import AuthTextField from "@/components/common/authTextField";
import AuthFormNavLink from "@/components/common/authFormNavLink";
import PrimaryButton from "@/components/common/primaryButton";
import { AUTH_FORM_TEXT_SIZE } from "../../constants/authFormField";
import { colors } from "../../constants/colors";
import { textBody, textHeading } from "../../constants/typography";
import { apiRequest, ApiRequestError } from "../../lib/api";
import { saveAuthSession } from "../../lib/auth-session";

/** Текст уведомления без заголовка (веб + натив). */
function showRegisterLine(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
    return;
  }
  Alert.alert("", message);
}

/** Кириллица в пароле не допускается — только латиница. */
function passwordContainsCyrillic(value: string): boolean {
  return /[А-Яа-яЁё]/.test(value);
}

/** Хотя бы одна латинская буква. */
function passwordHasLatinLetter(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

function passwordHasDigit(value: string): boolean {
  return /[0-9]/.test(value);
}

/** Ответ регистрации: почта уже есть в БД (эндпоинт не отдаёт список — ориентируемся на статус и текст). */
function isDuplicateEmailError(err: ApiRequestError): boolean {
  const { status, message } = err;
  const m = message.toLowerCase();
  if (status === 409) return true;
  if (
    /already exists|already registered|duplicate|unique constraint|email.*taken|user.*exists/i.test(
      message,
    )
  ) {
    return true;
  }
  if (
    /уже существует|уже зарегистрирован|занят|не уникал|дубликат|повтор/i.test(message)
  ) {
    return true;
  }
  if (status === 400 && /email|почт|e-mail/i.test(m) && /exist|unique|занят|существует|invalid/i.test(m)) {
    return true;
  }
  return false;
}

/** Практичная проверка email: не пробелы, есть @ и точка в домене. */
function isValidEmail(value: string): boolean {
  const t = value.trim();
  if (t.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

type RegisterResponse = {
  id: string;
  email: string;
  role: "ALEXITHYMIC" | "THERAPIST" | "ADMIN";
  therapistCode: string | null;
  clientCode: string | null;
  accessToken: string;
  refreshToken: string;
};

export default function Register() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [role, setRole] = useState<"client" | "therapist" | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordRepeat || !role) {
      showRegisterLine("Заполните все поля и выберите роль.");
      return;
    }

    if (!isValidEmail(email)) {
      showRegisterLine(
        "Некорректный email. Введите адрес в формате: имя@почта.домен (например, user@gmail.com).",
      );
      return;
    }

    if (password.length < 8) {
      showRegisterLine("Пароль должен быть не короче 8 символов.");
      return;
    }

    if (passwordContainsCyrillic(password)) {
      showRegisterLine(
        "В пароле можно использовать только латинские буквы (A–Z, a–z).",
      );
      return;
    }

    if (!passwordHasLatinLetter(password)) {
      showRegisterLine(
        "Пароль должен содержать хотя бы одну латинскую букву (A–Z, a–z).",
      );
      return;
    }

    if (!passwordHasDigit(password)) {
      showRegisterLine("Пароль должен содержать хотя бы одну цифру.");
      return;
    }

    if (password !== passwordRepeat) {
      showRegisterLine(
        "Пароли не совпадают.",
      );
      return;
    }

    const mappedRole = role === "client" ? "ALEXITHYMIC" : "THERAPIST";

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
        therapistCode: data.therapistCode,
        clientCode: data.clientCode,
      });

      if (mappedRole === "ALEXITHYMIC") {
        router.replace("/client");
      } else {
        router.replace("/therapist");
      }
    } catch (error) {
      if (error instanceof ApiRequestError && isDuplicateEmailError(error)) {
        showRegisterLine("Указанная почта уже зарегистрирована.");
        return;
      }
      showRegisterLine(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Регистрация</Text>

      <AuthTextField placeholder="Имя" value={name} onChangeText={setName} />

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
        textContentType="newPassword"
        autoComplete="password-new"
      />

      <AuthPasswordField
        placeholder="Повторите пароль"
        value={passwordRepeat}
        onChangeText={setPasswordRepeat}
        textContentType="newPassword"
        autoComplete="password-new"
        accessibilityLabelWhenHidden="Показать повтор пароля"
        accessibilityLabelWhenVisible="Скрыть повтор пароля"
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

      <PrimaryButton
        title={loading ? "Регистрация..." : "Зарегистрироваться"}
        onPress={() => void handleRegister()}
        disabled={loading}
        flushHorizontal
        titleFontWeight="500"
      />

      <AuthFormNavLink
        question="Уже есть аккаунт?"
        action="Войти"
        onPress={() => router.push("/auth/login")}
      />
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingVertical: 32,
    justifyContent: "center",
  },

  title: {
    ...textHeading,
    fontSize: 24,
    marginBottom: 30,
    color: colors.text,
    textAlign: "center",
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
    ...textBody,
    fontSize: AUTH_FORM_TEXT_SIZE,
    color: colors.primary,
  },

  roleTextActive: {
    color: "#fff",
  },
});
