// Thin fetch wrapper for the KAJOK API — attaches JWT, normalizes errors.
const TOKEN_KEY = 'kajok_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t: string | null) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as any) };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let res: Response;
  try {
    res = await fetch(`/api${path}`, { ...options, headers });
  } catch {
    throw new ApiError(0, 'NETWORK', 'تعذر الاتصال بالخادم / Could not reach the server');
  }
  let body: any = null;
  try { body = await res.json(); } catch { /* empty body */ }
  if (!res.ok) {
    throw new ApiError(res.status, body?.error || 'ERROR', body?.message || `Request failed (${res.status})`);
  }
  return body as T;
}
