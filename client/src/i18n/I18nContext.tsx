import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { translations, type Lang } from './translations';

interface I18n {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18n | null>(null);
const LANG_KEY = 'kajok_lang';

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => (localStorage.getItem(LANG_KEY) as Lang) || 'ar');

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  const t = useCallback((key: string, vars?: Record<string, string | number>) => {
    let str = translations[lang][key] ?? translations.en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) str = str.replace(`{${k}}`, String(v));
    return str;
  }, [lang]);

  const value = useMemo(() => ({ lang, dir: lang === 'ar' ? 'rtl' as const : 'ltr' as const, setLang, toggleLang, t }), [lang, setLang, toggleLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
}
