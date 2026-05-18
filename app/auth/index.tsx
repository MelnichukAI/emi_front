import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AuthCodeField from "@/components/common/authCodeField";
import AuthPasswordField from "@/components/common/authPasswordField";
import AuthTextField from "@/components/common/authTextField";
import AuthFormNavLink from "@/components/common/authFormNavLink";
import PrimaryButton from "@/components/common/primaryButton";
import { AUTH_FORM_TEXT_SIZE } from "../../constants/authFormField";
import { colors } from "../../constants/colors";
import { textBody, textHeading } from "../../constants/typography";
import { apiRequest, ApiRequestError } from "../../lib/api";
import {
  isValidEmail,
  isValidRegistrationCode,
  mapRegisterError,
  mapSendCodeError,
  validatePasswordPair,
} from "../../lib/auth-register-validation";
import { saveAuthSession } from "../../lib/auth-session";
import { screenTopPadding } from "../../lib/screen-top-padding";

type RegisterStep = "email" | "code" | "details";

type RegisterResponse = {
  id: string;
  email: string;
  role: "ALEXITHYMIC" | "THERAPIST" | "ADMIN";
  therapistCode: string | null;
  clientCode: string | null;
  accessToken: string;
  refreshToken: string;
};

type SendCodeResponse = {
  success: boolean;
  expiresInSeconds?: number;
};

const RESEND_COOLDOWN_SEC = 60;

function showRegisterLine(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
    return;
  }
  Alert.alert("", message);
}

export default function Register() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<RegisterStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");
  const [role, setRole] = useState<"client" | "therapist" | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

  useEffect(() => {
    if (resendSecondsLeft <= 0) return;
    const timer = setInterval(() => {
      setResendSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendSecondsLeft]);

  const normalizedEmail = email.trim().toLowerCase();

  const sendCode = useCallback(
    async (targetEmail: string) => {
      await apiRequest<SendCodeResponse>("/auth/register/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      setResendSecondsLeft(RESEND_COOLDOWN_SEC);
    },
    [],
  );

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      showRegisterLine(
        "Некорректный email. Введите адрес в формате: имя@почта.домен (например, user@gmail.com).",
      );
      return;
    }

    try {
      setLoading(true);
      await sendCode(normalizedEmail);
      setCode("");
      setStep("code");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        showRegisterLine(mapSendCodeError(error));
        return;
      }
      showRegisterLine(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendSecondsLeft > 0) return;
    try {
      setLoading(true);
      await sendCode(normalizedEmail);
      showRegisterLine("Новый код отправлен на почту.");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        showRegisterLine(mapSendCodeError(error));
        return;
      }
      showRegisterLine(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmCode = () => {
    if (!isValidRegistrationCode(code)) {
      showRegisterLine("Введите 6-значный код из письма.");
      return;
    }
    setStep("details");
  };

  const handleRegister = async () => {
    if (!name.trim() || !password || !passwordRepeat || !role) {
      showRegisterLine("Заполните все поля и выберите роль.");
      return;
    }

    if (!isValidRegistrationCode(code)) {
      showRegisterLine("Введите 6-значный код из письма.");
      setStep("code");
      return;
    }

    const passwordError = validatePasswordPair(password, passwordRepeat);
    if (passwordError) {
      showRegisterLine(passwordError);
      return;
    }

    const mappedRole = role === "client" ? "ALEXITHYMIC" : "THERAPIST";

    try {
      setLoading(true);
      const data = await apiRequest<RegisterResponse>("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          code: code.trim(),
          password,
          role: mappedRole,
          fullName: name.trim(),
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
      if (error instanceof ApiRequestError) {
        const message = mapRegisterError(error);
        showRegisterLine(message);
        if (/код|code/i.test(message)) {
          setStep("code");
        }
        return;
      }
      showRegisterLine(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
  };

  const stepTitles: Record<RegisterStep, string> = {
    email: "Регистрация",
    code: "Код из письма",
    details: "Ваши данные",
  };

  const stepHints: Record<RegisterStep, string> = {
    email: "Шаг 1 из 3 — укажите почту, мы отправим код подтверждения.",
    code: "Шаг 2 из 3 — введите 6 цифр из письма.",
    details: "Шаг 3 из 3 — имя, пароль и роль.",
  };

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { paddingTop: screenTopPadding(insets.top) },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>{stepTitles[step]}</Text>
      <Text style={styles.hint}>{stepHints[step]}</Text>

      {step === "email" ? (
        <>
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
          <PrimaryButton
            title={loading ? "Отправка…" : "Получить код"}
            onPress={() => void handleSendCode()}
            disabled={loading}
            flushHorizontal
            titleFontWeight="500"
          />
        </>
      ) : null}

      {step === "code" ? (
        <>
          <View style={styles.emailBadge}>
            <Text style={styles.emailBadgeLabel}>Почта</Text>
            <Text style={styles.emailBadgeValue}>{normalizedEmail}</Text>
          </View>

          <AuthCodeField
            value={code}
            onChangeText={setCode}
            accessibilityLabel="Код подтверждения из письма"
          />

          <PrimaryButton
            title="Продолжить"
            onPress={handleConfirmCode}
            disabled={loading}
            flushHorizontal
            titleFontWeight="500"
          />

          <Pressable
            onPress={() => void handleResendCode()}
            disabled={loading || resendSecondsLeft > 0}
            style={({ pressed }) => [
              styles.secondaryAction,
              (pressed || loading || resendSecondsLeft > 0) && styles.pressed,
            ]}
          >
            <Text style={styles.secondaryActionText}>
              {resendSecondsLeft > 0
                ? `Отправить снова (${resendSecondsLeft} с)`
                : "Отправить код снова"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setStep("email")}
            style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
          >
            <Text style={styles.backLinkText}>Изменить email</Text>
          </Pressable>
        </>
      ) : null}

      {step === "details" ? (
        <>
          <View style={styles.emailBadge}>
            <Text style={styles.emailBadgeLabel}>Почта подтверждена</Text>
            <Text style={styles.emailBadgeValue}>{normalizedEmail}</Text>
          </View>

          <AuthTextField placeholder="Имя" value={name} onChangeText={setName} />

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
              style={[
                styles.roleButton,
                role === "therapist" && styles.roleActive,
              ]}
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
            title={loading ? "Регистрация…" : "Зарегистрироваться"}
            onPress={() => void handleRegister()}
            disabled={loading}
            flushHorizontal
            titleFontWeight="500"
          />

          <Pressable
            onPress={() => setStep("code")}
            style={({ pressed }) => [styles.backLink, pressed && styles.pressed]}
          >
            <Text style={styles.backLinkText}>Вернуться к коду</Text>
          </Pressable>
        </>
      ) : null}

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
    paddingBottom: 32,
    justifyContent: "center",
  },
  title: {
    ...textHeading,
    fontSize: 24,
    marginBottom: 8,
    color: colors.text,
    textAlign: "center",
  },
  hint: {
    ...textBody,
    fontSize: 14,
    color: colors.subtext,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  emailBadge: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#D9DFEF",
  },
  emailBadgeLabel: {
    fontSize: 12,
    color: colors.subtext,
    marginBottom: 4,
  },
  emailBadgeValue: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  secondaryAction: {
    alignItems: "center",
    paddingVertical: 12,
    marginTop: 4,
  },
  secondaryActionText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 14,
  },
  backLink: {
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 4,
  },
  backLinkText: {
    color: colors.subtext,
    fontSize: 14,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.85,
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
