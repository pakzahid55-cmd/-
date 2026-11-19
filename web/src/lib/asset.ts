/** Resolve public asset paths against the deploy base URL (e.g. /-/ on GitHub Pages). */
const BASE = import.meta.env.BASE_URL || "/";

export function asset(p: string): string {
  if (!p) return p;
  return p.startsWith("/") ? BASE + p.slice(1) : p;
}
