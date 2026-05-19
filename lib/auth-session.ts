import AsyncStorage from "@react-native-async-storage/async-storage";

import { clearOaeScore } from "./oae-score-session";

const STORAGE_KEY = "@emi/auth_session";

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  /** Код клиента (ALEXITHYMIC), приходит с `/auth/login` и `/auth/register`. */
  clientCode?: string | null;
  /** Код терапевта, приходит с `/auth/login` и `/auth/register`. */
  therapistCode?: string | null;
};

let session: AuthSession | null = null;
let hydratePromise: Promise<AuthSession | null> | null = null;

function isValidSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") return false;
  const data = value as AuthSession;
  return (
    typeof data.accessToken === "string" &&
    data.accessToken.length > 0 &&
    typeof data.refreshToken === "string" &&
    data.refreshToken.length > 0
  );
}

async function persistSession(data: AuthSession | null) {
  try {
    if (data) {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    // Не блокируем UI при ошибке записи на диск.
  }
}

/** Загрузить сессию с устройства в память (один раз за запуск приложения). */
export async function hydrateAuthSession(): Promise<AuthSession | null> {
  if (session) return session;
  if (hydratePromise) return hydratePromise;

  hydratePromise = (async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (!raw) {
        session = null;
        return null;
      }

      const parsed: unknown = JSON.parse(raw);
      if (!isValidSession(parsed)) {
        session = null;
        await AsyncStorage.removeItem(STORAGE_KEY);
        return null;
      }

      session = parsed;
      return session;
    } catch {
      session = null;
      return null;
    }
  })();

  return hydratePromise;
}

export function getAuthSession() {
  return session;
}

export function saveAuthSession(data: AuthSession) {
  session = data;
  void persistSession(data);
}

/** Обновить коды без повторного логина (например после `GET /users/me`). */
export function updateAuthCodes(partial: {
  clientCode?: string | null;
  therapistCode?: string | null;
}) {
  if (!session) return;
  session = { ...session, ...partial };
  void persistSession(session);
}

export function getAccessToken() {
  return session?.accessToken ?? null;
}

export function getClientCode() {
  return session?.clientCode ?? null;
}

export function clearAuthSession() {
  session = null;
  clearOaeScore();
  void persistSession(null);
}

/** Маршрут главного экрана после входа или при автозапуске. */
export function getHomePathForSession(data: AuthSession | null = session): string {
  if (!data?.accessToken) return "/auth/login";
  if (data.therapistCode) return "/therapist";
  return "/client";
}
