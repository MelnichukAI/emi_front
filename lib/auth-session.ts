type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

let session: AuthTokens | null = null;

export function saveAuthSession(tokens: AuthTokens) {
  session = tokens;
}

export function getAccessToken() {
  return session?.accessToken ?? null;
}

export function clearAuthSession() {
  session = null;
}
