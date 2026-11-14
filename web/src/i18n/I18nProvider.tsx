import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { en, type Dict } from "./en";
import { ar } from "./ar";

export type Lang = "en" | "ar";

const dictionaries: Record<Lang, Dict> = { en, ar };

interface I18nContextValue {
  lang: Lang;
  dir: "ltr" | "rtl";
  t: (key: string, vars?: Record<string, string | number>) => string;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  /** Pick an EN/AR field from API data. */
  pick: (enValue: string, arValue: string) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function lookup(dict: Dict, key: string): string | undefined {
  let node: unknown = dict;
  for (const part of key.split(".")) {
    if (typeof node !== "object" || node === null) return undefined;
    node = (node as Record<string, unknown>)[part];
  }
  return typeof node === "string" ? node : undefined;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const saved = localStorage.getItem("kajok.lang");
    return saved === "ar" || saved === "en" ? saved : "en";
  });

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    localStorage.setItem("kajok.lang", lang);
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((l) => (l === "en" ? "ar" : "en")), []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      const raw = lookup(dictionaries[lang], key) ?? lookup(en, key) ?? key;
      if (!vars) return raw;
      return raw.replace(/\{(\w+)\}/g, (_m, name: string) => String(vars[name] ?? `{${name}}`));
    },
    [lang],
  );

  const pick = useCallback((enValue: string, arValue: string) => (lang === "ar" ? arValue || enValue : enValue || arValue), [lang]);

  const value = useMemo<I18nContextValue>(() => ({ lang, dir, t, setLang, toggleLang, pick }), [lang, dir, t, setLang, toggleLang, pick]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
