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
import { colors } from "../../constants/colors";
import { textBody, textHeading } from "../../constants/typography";
import { apiRequest, ApiRequestError } from "../../lib/api";
import {
  isValidEmail,
  isValidRegistrationCode,
  mapForgotResetError,
  mapForgotSendCodeError,
  validatePasswordPair,
} from "../../lib/auth-register-validation";
import { saveAuthSession } from "../../lib/auth-session";
import { screenTopPadding } from "../../lib/screen-top-padding";

type ForgotStep = "email" | "reset";

type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  therapistCode: string | null;
  clientCode: string | null;
};

const RESEND_COOLDOWN_SEC = 60;

function showMessage(message: string) {
  if (Platform.OS === "web") {
    window.alert(message);
    return;
  }
  Alert.alert("", message);
}

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<ForgotStep>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  const sendCode = useCallback(async (targetEmail: string) => {
    await apiRequest<{ success: boolean }>("/auth/forgot-password/send-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: targetEmail }),
    });
    setResendSecondsLeft(RESEND_COOLDOWN_SEC);
  }, []);

  const handleSendCode = async () => {
    if (!isValidEmail(email)) {
      showMessage(
        "Некорректный email. Введите адрес в формате: имя@почта.домен.",
      );
      return;
    }

    try {
      setLoading(true);
      await sendCode(normalizedEmail);
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setStep("reset");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        showMessage(mapForgotSendCodeError(error));
        return;
      }
      showMessage(
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
      showMessage("Новый код отправлен на почту.");
    } catch (error) {
      if (error instanceof ApiRequestError) {
        showMessage(mapForgotSendCodeError(error));
        return;
      }
      showMessage(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
  };

  const navigateAfterLogin = (data: LoginResponse) => {
    saveAuthSession({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      therapistCode: data.therapistCode,
      clientCode: data.clientCode,
    });
    if (data.therapistCode) {
      router.replace("/therapist");
    } else {
      router.replace("/client");
    }
  };

  const handleResetPassword = async () => {
    if (!isValidRegistrationCode(code)) {
      showMessage("Введите 6-значный код из письма.");
      return;
    }

    const passwordError = validatePasswordPair(newPassword, confirmPassword);
    if (passwordError) {
      showMessage(passwordError);
      return;
    }

    try {
      setLoading(true);
      await apiRequest<{ success: boolean }>("/auth/forgot-password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          code: code.trim(),
          newPassword,
          confirmPassword,
        }),
      });

      const loginData = await apiRequest<LoginResponse>("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: normalizedEmail,
          password: newPassword,
        }),
      });

      navigateAfterLogin(loginData);
    } catch (error) {
      if (error instanceof ApiRequestError) {
        showMessage(mapForgotResetError(error));
        return;
      }
      showMessage(
        error instanceof Error ? error.message : "Ошибка соединения с сервером",
      );
    } finally {
      setLoading(false);
    }
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
      <Text style={styles.title}>
        {step === "email" ? "Восстановление пароля" : "Новый пароль"}
      </Text>
      <Text style={styles.hint}>
        {step === "email"
          ? "Введите почту аккаунта — мы отправим код из 6 цифр."
          : "Введите код из письма и задайте новый пароль."}
      </Text>

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
      ) : (
        <>
          <View style={styles.emailBadge}>
            <Text style={styles.emailBadgeLabel}>Почта</Text>
            <Text style={styles.emailBadgeValue}>{normalizedEmail}</Text>
          </View>

          <AuthCodeField
            value={code}
            onChangeText={setCode}
            accessibilityLabel="Код из письма"
          />

          <AuthPasswordField
            placeholder="Новый пароль"
            value={newPassword}
            onChangeText={setNewPassword}
            textContentType="newPassword"
            autoComplete="password-new"
          />

          <AuthPasswordField
            placeholder="Повторите пароль"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            accessibilityLabelWhenHidden="Показать повтор пароля"
            accessibilityLabelWhenVisible="Скрыть повтор пароля"
          />

          <PrimaryButton
            title={loading ? "Сохранение…" : "Сохранить и войти"}
            onPress={() => void handleResetPassword()}
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
      )}

      <AuthFormNavLink
        question="Вспомнили пароль?"
        action="Войти"
        onPress={() => router.replace("/auth/login")}
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
});
