import { API_BASE_URL } from "./api";
import {
  clearAuthSession,
  getAuthSession,
  getRefreshToken,
  updateAuthTokens,
} from "./auth-session";

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

let refreshPromise: Promise<boolean> | null = null;

/** Обновить access/refresh по refreshToken. Возвращает false, если сессию нужно сбросить. */
export async function refreshAuthTokens(): Promise<boolean> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken || !API_BASE_URL) {
      return false;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        clearAuthSession();
        return false;
      }

      const data = (await response.json()) as RefreshResponse;
      if (
        typeof data.accessToken !== "string" ||
        typeof data.refreshToken !== "string"
      ) {
        clearAuthSession();
        return false;
      }

      const current = getAuthSession();
      updateAuthTokens({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        clientCode: current?.clientCode,
        therapistCode: current?.therapistCode,
      });
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}
