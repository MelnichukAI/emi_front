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

/** Временный обход при недоступном бэке: убрать перед продакшеном. */
export function saveDevBypassSession() {
  session = {
    accessToken: "__dev_bypass_no_backend__",
    refreshToken: "__dev_bypass_no_backend__",
  };
}
