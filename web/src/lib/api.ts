import { firebaseAuth, firebaseEnabled } from './firebase';
export const API_BASE = "";

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) {
    super(message);
  }
}

export async function getToken() {
  return firebaseEnabled ? firebaseAuth().currentUser?.getIdToken() : localStorage.getItem("kujuk.token");
}

export function setToken(token: string | null): void {
  if (token) localStorage.setItem("kujuk.token", token);
  else localStorage.removeItem("kujuk.token");
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  signal?: AbortSignal;
  headers?: Record<string, string>;
}

export async function api<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = { ...options.headers };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  const token = auth ? await getToken() : null;
  if (auth && token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}/api${path}`, {
    method,
    headers,
    signal: options.signal,
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
