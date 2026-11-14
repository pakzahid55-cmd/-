/**
 * KAJOK API client.
 * All calls go to the same origin under /api (proxied to the backend in dev).
 */

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

function getToken(): string | null {
  return localStorage.getItem("kajok.token");
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem("kajok.token", token);
  else localStorage.removeItem("kajok.token");
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = getToken();
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }

  if (!res.ok) {
    const err = data as { error?: string; details?: unknown } | null;
    if (res.status === 401 && token) {
      // Token invalid/expired — clear it so UI falls back to guest state.
      setToken(null);
    }
    throw new ApiError(res.status, err?.error ?? `Request failed (${res.status})`, err?.details);
  }
  return data as T;
}
