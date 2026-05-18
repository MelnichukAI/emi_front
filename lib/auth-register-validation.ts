import { ApiRequestError } from "./api";

export function isValidEmail(value: string): boolean {
  const t = value.trim();
  if (t.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t);
}

export function passwordContainsCyrillic(value: string): boolean {
  return /[А-Яа-яЁё]/.test(value);
}

export function passwordHasLatinLetter(value: string): boolean {
  return /[A-Za-z]/.test(value);
}

export function passwordHasDigit(value: string): boolean {
  return /[0-9]/.test(value);
}

export function isValidRegistrationCode(value: string): boolean {
  return /^\d{6}$/.test(value.trim());
}

export function validatePasswordPair(
  password: string,
  passwordRepeat: string,
): string | null {
  if (password.length < 8) {
    return "Пароль должен быть не короче 8 символов.";
  }
  if (passwordContainsCyrillic(password)) {
    return "В пароле можно использовать только латинские буквы (A–Z, a–z).";
  }
  if (!passwordHasLatinLetter(password)) {
    return "Пароль должен содержать хотя бы одну латинскую букву (A–Z, a–z).";
  }
  if (!passwordHasDigit(password)) {
    return "Пароль должен содержать хотя бы одну цифру.";
  }
  if (password !== passwordRepeat) {
    return "Пароли не совпадают.";
  }
  return null;
}

export function isDuplicateEmailError(err: ApiRequestError): boolean {
  const { status, message } = err;
  const m = message.toLowerCase();
  if (status === 409) return true;
  if (
    /already exists|already registered|duplicate|unique constraint|email.*taken|user.*exists|email already in use/i.test(
      message,
    )
  ) {
    return true;
  }
  if (
    /уже существует|уже зарегистрирован|занят|не уникал|дубликат|повтор/i.test(
      message,
    )
  ) {
    return true;
  }
  if (
    status === 400 &&
    /email|почт|e-mail/i.test(m) &&
    /exist|unique|занят|существует|invalid|in use/i.test(m)
  ) {
    return true;
  }
  return false;
}

export function mapSendCodeError(err: ApiRequestError): string {
  if (isDuplicateEmailError(err)) {
    return "Указанная почта уже зарегистрирована.";
  }
  if (err.status === 429 || /wait before requesting/i.test(err.message)) {
    return "Подождите минуту перед повторной отправкой кода.";
  }
  return err.message || "Не удалось отправить код.";
}

export function mapRegisterError(err: ApiRequestError): string {
  if (isDuplicateEmailError(err)) {
    return "Указанная почта уже зарегистрирована.";
  }
  if (/invalid verification code/i.test(err.message)) {
    return "Неверный код подтверждения.";
  }
  if (/expired|not found/i.test(err.message)) {
    return "Код истёк или не найден. Запросите новый код.";
  }
  if (/code must be exactly 6 digits/i.test(err.message)) {
    return "Код должен состоять из 6 цифр.";
  }
  return err.message || "Ошибка регистрации.";
}
