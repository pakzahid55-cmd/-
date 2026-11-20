import { create } from "zustand";
import { api } from "../lib/api";
import { setCurrentCurrency, type Currency } from "../lib/format";

interface CurrencyInfo {
  base: "EGP";
  quote: "SDG";
  rate: number | null;
  updatedAt: string | null;
  source: "manual" | null;
}

interface CurrencyState {
  currency: Currency;
  info: CurrencyInfo;
  setCurrency: (currency: Currency) => void;
  refresh: () => Promise<void>;
}

const STORE_KEY = "kujuk.currency";

function apply(currency: Currency, rate: number | null): void {
  // SDG is only usable when an admin has entered a rate — never fabricate one.
  const safe: Currency = currency === "SDG" && !rate ? "EGP" : currency;
  setCurrentCurrency(safe, rate);
  localStorage.setItem(STORE_KEY, safe);
}

export const useCurrency = create<CurrencyState>((set, get) => ({
  currency: typeof window !== "undefined" && localStorage.getItem(STORE_KEY) === "SDG" ? "SDG" : "EGP",
  info: { base: "EGP", quote: "SDG", rate: null, updatedAt: null, source: null },

  setCurrency: (currency) => {
    apply(currency, get().info.rate);
    set({ currency: currency === "SDG" && !get().info.rate ? "EGP" : currency });
  },

  refresh: async () => {
    try {
      const info = await api<CurrencyInfo>("/currency", { auth: false });
      apply(get().currency, info.rate);
      set({ info, currency: typeof window !== "undefined" && localStorage.getItem(STORE_KEY) === "SDG" ? "SDG" : "EGP" });
    } catch {
      // Offline / server down: keep EGP display, never guess a rate.
    }
  },
}));
