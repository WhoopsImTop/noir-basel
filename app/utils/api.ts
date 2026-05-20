/** Zentrale API-Basis — konfiguriert über `NUXT_PUBLIC_API_BASE` in `.env` */
export const getApiBaseUrl = (): string => {
  const config = useRuntimeConfig();
  return config.public.apiBase as string;
};

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(status: number, message: string, payload: unknown) {
    super(message);
    this.status = status;
    this.payload = payload;
  }
}

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  auth?: boolean;
  body?: unknown;
}

const collectValidationMessages = (errors: unknown): string[] => {
  if (!errors || typeof errors !== "object") return [];
  return Object.values(errors as Record<string, unknown>)
    .flatMap((value) => {
      if (typeof value === "string") return value.trim() ? [value] : [];
      if (Array.isArray(value)) {
        return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
      }
      return [];
    })
    .filter(Boolean);
};

const normalizeErrorMessage = (payload: any, fallback: string): string => {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }
  if (payload && typeof payload.message === "string" && payload.message.trim()) {
    return payload.message;
  }
  if (payload && typeof payload.error === "string" && payload.error.trim()) {
    return payload.error;
  }
  const fromErrors = collectValidationMessages(payload?.errors);
  if (fromErrors.length) {
    return fromErrors.slice(0, 4).join(" ");
  }
  return fallback;
};

const fallbackForStatus = (status: number): string => {
  switch (status) {
    case 400:
      return "Die Anfrage war ungültig. Bitte Eingaben prüfen und erneut versuchen.";
    case 401:
      return "Sitzung abgelaufen oder nicht angemeldet. Bitte erneut einloggen.";
    case 403:
      return "Keine Berechtigung für diese Aktion.";
    case 404:
      return "Die angeforderte Ressource wurde nicht gefunden.";
    case 408:
      return "Zeitüberschreitung. Bitte Verbindung prüfen und erneut versuchen.";
    case 409:
      return "Konflikt mit bestehenden Daten. Bitte Seite aktualisieren oder Auswahl anpassen.";
    case 422:
      return "Eingaben konnten nicht verarbeitet werden. Bitte prüfen oder einen anderen Slot wählen.";
    case 429:
      return "Zu viele Anfragen. Bitte kurz warten und erneut versuchen.";
    case 500:
    case 502:
    case 503:
    case 504:
      return "Der Server ist vorübergehend nicht erreichbar. Bitte später erneut versuchen.";
    default:
      if (status >= 500) {
        return "Serverfehler. Bitte später erneut versuchen.";
      }
      return "Die Anfrage ist fehlgeschlagen. Bitte erneut versuchen.";
  }
};

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError;

export const apiRequest = async <T>(path: string, options: ApiRequestOptions = {}): Promise<T> => {
  const headers = new Headers(options.headers ?? {});
  headers.set("Accept", "application/json");

  const isJsonBody = options.body !== undefined && options.body !== null;
  if (isJsonBody) {
    headers.set("Content-Type", "application/json");
  }

  if (options.auth && process.client) {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  let response: Response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers,
      body: isJsonBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      0,
      "Netzwerkfehler. Bitte Internetverbindung prüfen und erneut versuchen.",
      null,
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const fallback = fallbackForStatus(response.status);
    throw new ApiError(response.status, normalizeErrorMessage(payload, fallback), payload);
  }

  return payload as T;
};

export const toCsv = (values: Array<number | string>) => values.join(",");

export const parseCsvNumbers = (value: string): number[] =>
  value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item) && item > 0);
