import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../lib/api';
import { DEFAULT_SETTINGS, formatPrice, type Currency, type PublicSettings } from '../lib/price';
import { useI18n } from '../i18n/I18nContext';
import { useAuth } from './AuthContext';

export type Country = 'EG' | 'SD';

interface CurrencyContextValue {
  currency: Currency;
  country: Country;
  settings: PublicSettings;
  settingsLoaded: boolean;
  setCurrency: (c: Currency) => void;
  setCountry: (c: Country) => void; // also auto-selects the market's currency
  fmt: (amount: number, cur?: Currency) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);
const CUR_KEY = 'kajok_currency';
const CTRY_KEY = 'kajok_country';

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const { lang } = useI18n();
  const { user, updateProfile } = useAuth();
  const [settings, setSettings] = useState<PublicSettings>(DEFAULT_SETTINGS);
  const [settingsLoaded, setSettingsLoaded] = useState(false);
  const [currency, setCurrencyState] = useState<Currency>(() => (localStorage.getItem(CUR_KEY) as Currency) || 'EGP');
  const [country, setCountryState] = useState<Country>(() => (localStorage.getItem(CTRY_KEY) as Country) || 'EG');

  // Load public currency settings once
  useEffect(() => {
    api<{ settings: PublicSettings }>('/settings/public')
      .then(d => {
        setSettings(d.settings);
        // First visit (no explicit preference stored): adopt the store default market
        if (!localStorage.getItem(CUR_KEY)) setCurrencyState(d.settings.defaultCurrency);
        if (!localStorage.getItem(CTRY_KEY)) setCountryState(d.settings.defaultCountry);
      })
      .catch(() => { /* keep defaults */ })
      .finally(() => setSettingsLoaded(true));
  }, []);

  // When the user logs in, apply their server-side preferences
  useEffect(() => {
    if (user?.currency) setCurrencyState(user.currency);
    if (user?.country) setCountryState(user.country);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const persist = useCallback((cur: Currency, ctry: Country) => {
    localStorage.setItem(CUR_KEY, cur);
    localStorage.setItem(CTRY_KEY, ctry);
    if (user) updateProfile({ currency: cur, country: ctry }).catch(() => {});
  }, [user, updateProfile]);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    persist(c, country);
  }, [country, persist]);

  const setCountry = useCallback((c: Country) => {
    setCountryState(c);
    // Selecting a market auto-selects its currency (per KAJOK market rules)
    const marketCurrency: Currency = c === 'SD' ? 'SDG' : 'EGP';
    setCurrencyState(marketCurrency);
    persist(marketCurrency, c);
  }, [persist]);

  const fmt = useCallback((amount: number, cur?: Currency) => formatPrice(amount, cur || currency, lang), [currency, lang]);

  const value = useMemo<CurrencyContextValue>(() => ({
    currency, country, settings, settingsLoaded, setCurrency, setCountry, fmt,
  }), [currency, country, settings, settingsLoaded, setCurrency, setCountry, fmt]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used inside CurrencyProvider');
  return ctx;
}
