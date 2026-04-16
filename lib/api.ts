const rawUrl = process.env.EXPO_PUBLIC_API_URL?.trim() ?? "";

export const API_BASE_URL = rawUrl.endsWith("/")
  ? rawUrl.slice(0, -1)
  : rawUrl;

type ApiErrorBody = {
  message?: string | string[];
};

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

export async function apiRequest<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  if (!API_BASE_URL) {
    throw new Error(
      "Не задан EXPO_PUBLIC_API_URL. Добавьте его в переменные окружения."
    );
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options);
  } catch {
    const localhostHint =
      /localhost|127\.0\.0\.1/i.test(API_BASE_URL)
        ? " На телефоне/в Expo Go не используйте localhost — укажите IP компьютера в EXPO_PUBLIC_API_URL."
        : "";
    throw new Error(
      `Не удалось связаться с API (${API_BASE_URL}). Запустите бэкенд, проверьте адрес и фаервол.${localhostHint}`
    );
  }

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, "Ошибка запроса к серверу"));
  }

  return payload as TResponse;
}
