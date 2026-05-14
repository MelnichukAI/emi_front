export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  /** Код клиента (ALEXITHYMIC), приходит с `/auth/login` и `/auth/register`. */
  clientCode?: string | null;
  /** Код терапевта, приходит с `/auth/login` и `/auth/register`. */
  therapistCode?: string | null;
};

let session: AuthSession | null = null;

export function saveAuthSession(data: AuthSession) {
  session = data;
}

/** Обновить коды без повторного логина (например после `GET /users/me`). */
export function updateAuthCodes(partial: {
  clientCode?: string | null;
  therapistCode?: string | null;
}) {
  if (!session) return;
  session = { ...session, ...partial };
}

export function getAccessToken() {
  return session?.accessToken ?? null;
}

export function getClientCode() {
  return session?.clientCode ?? null;
}

export function clearAuthSession() {
  session = null;
}
