import { getAccessToken } from "./auth-session";
import { refreshAuthTokens } from "./auth-refresh";

const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";

export const API_BASE_URL = rawUrl.endsWith("/")
  ? rawUrl.slice(0, -1)
  : rawUrl;

type ApiErrorBody = {
  message?: string | string[];
};

export class ApiRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
  }
}

function getErrorMessage(payload: unknown, fallback: string): string {
  if (typeof payload !== "object" || payload === null) return fallback;

  const body = payload as ApiErrorBody;
  if (Array.isArray(body.message) && body.message.length > 0) {
    return body.message.join(", ");
  }
  if (typeof body.message === "string" && body.message.length > 0) {
    return body.message;
  }

  return fallback;
}

function shouldRetryWithRefresh(path: string, options: RequestInit): boolean {
  if (!path.startsWith("/auth/")) return true;
  return path === "/auth/logout";
}

function withBearerToken(options: RequestInit, token: string | null): RequestInit {
  if (!token) return options;

  const headers = new Headers(options.headers as HeadersInit | undefined);
  headers.set("Authorization", `Bearer ${token}`);
  return { ...options, headers };
}

async function parseApiResponse<TResponse>(response: Response): Promise<TResponse> {
  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new ApiRequestError(
      getErrorMessage(payload, "Ошибка запроса к серверу"),
      response.status,
    );
  }

  return payload as TResponse;
}

async function performFetch(path: string, options: RequestInit): Promise<Response> {
  try {
    return await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    const localhostHint =
      /localhost|127\.0\.0\.1/i.test(API_BASE_URL)
        ? " На телефоне/в Expo Go не используйте localhost — укажите IP компьютера в EXPO_PUBLIC_API_URL."
        : "";
    throw new Error(
      `Не удалось связаться с сервером.${localhostHint}`,
    );
  }
}

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {},
  retryOnUnauthorized = true,
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "Не задан EXPO_PUBLIC_API_URL. Добавьте его в переменные окружения.",
    );
  }

  let response = await performFetch(path, options);

  if (
    response.status === 401 &&
    retryOnUnauthorized &&
    shouldRetryWithRefresh(path, options)
  ) {
    const refreshed = await refreshAuthTokens();
    if (refreshed) {
      const token = getAccessToken();
      response = await performFetch(path, withBearerToken(options, token));
    }
  }

  return parseApiResponse<TResponse>(response);
}
