import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Language = 'ru' | 'en' | 'he';
export type CurrencyCode = 'USD' | 'EUR' | 'ILS' | 'RUB' | 'BYN';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  nameRu: string;
  nameEn: string;
  nameHe: string;
  rateToUSD: number; // units of currency per 1 USD
  change24h: number; // % change
}

export interface WalletBalance {
  id: string;
  currency: CurrencyCode;
  amount: number;
}

export interface FavoritePair {
  from: CurrencyCode;
  to: CurrencyCode;
}

interface AppContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  currencies: Record<CurrencyCode, Currency>;
  walletBalances: WalletBalance[];
  addBalance: (currency: CurrencyCode, amount: number) => void;
  updateBalance: (id: string, amount: number) => void;
  removeBalance: (id: string) => void;
  baseCurrency: CurrencyCode;
  setBaseCurrency: (currency: CurrencyCode) => void;
  needsOnboarding: boolean;
  completeOnboarding: (currency: CurrencyCode) => void;
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number;
  formatAmount: (amount: number) => string;
  getCurrencyName: (code: CurrencyCode) => string;
  favoritePairs: FavoritePair[];
  toggleFavoritePair: (from: CurrencyCode, to: CurrencyCode) => void;
  isFavoritePair: (from: CurrencyCode, to: CurrencyCode) => boolean;
  recentCurrencies: string[];
  addRecentCurrency: (code: string) => void;
}

const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: {
    code: 'USD',
    symbol: '$',
    nameRu: 'Доллар США',
    nameEn: 'US Dollar',
    nameHe: 'דולר אמריקאי',
    rateToUSD: 1.0,
    change24h: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    nameRu: 'Евро',
    nameEn: 'Euro',
    nameHe: 'יורו',
    rateToUSD: 0.925,
    change24h: 0.12,
  },
  ILS: {
    code: 'ILS',
    symbol: '₪',
    nameRu: 'Израильский шекель',
    nameEn: 'Israeli Shekel',
    nameHe: 'שקל ישראלי',
    rateToUSD: 3.67,
    change24h: -0.43,
  },
  RUB: {
    code: 'RUB',
    symbol: '₽',
    nameRu: 'Российский рубль',
    nameEn: 'Russian Ruble',
    nameHe: 'רובל רוסי',
    rateToUSD: 90.5,
    change24h: 0.85,
  },
  BYN: {
    code: 'BYN',
    symbol: 'Br',
    nameRu: 'Белорусский рубль',
    nameEn: 'Belarusian Ruble',
    nameHe: 'רובל בלרוסי',
    rateToUSD: 3.27,
    change24h: 0.22,
  },
};

const AppContext = createContext<AppContextType | null>(null);

const STORAGE_KEY = '@currency-compass/app-state-v1';
const CURRENCY_CODES: CurrencyCode[] = ['USD', 'EUR', 'ILS', 'RUB', 'BYN'];
const LANGUAGES: Language[] = ['ru', 'en', 'he'];

interface PersistedAppState {
  language: Language;
  baseCurrency: CurrencyCode;
  walletBalances: WalletBalance[];
  favoritePairs: FavoritePair[];
  recentCurrencies: string[];
  onboardingCompleted: boolean;
}

const isCurrencyCode = (value: unknown): value is CurrencyCode =>
  typeof value === 'string' && CURRENCY_CODES.includes(value as CurrencyCode);

const isLanguage = (value: unknown): value is Language =>
  typeof value === 'string' && LANGUAGES.includes(value as Language);

function parsePersistedState(value: string): Partial<PersistedAppState> {
  const parsed: unknown = JSON.parse(value);
  if (!parsed || typeof parsed !== 'object') return {};

  const state = parsed as Record<string, unknown>;
  const result: Partial<PersistedAppState> = {};

  if (isLanguage(state.language)) result.language = state.language;
  if (isCurrencyCode(state.baseCurrency))
    result.baseCurrency = state.baseCurrency;
  if (typeof state.onboardingCompleted === 'boolean')
    result.onboardingCompleted = state.onboardingCompleted;

  if (Array.isArray(state.walletBalances)) {
    result.walletBalances = state.walletBalances.filter(
      (balance): balance is WalletBalance =>
        Boolean(balance) &&
        typeof balance === 'object' &&
        typeof balance.id === 'string' &&
        isCurrencyCode(balance.currency) &&
        typeof balance.amount === 'number' &&
        Number.isFinite(balance.amount),
    );
  }

  if (Array.isArray(state.favoritePairs)) {
    result.favoritePairs = state.favoritePairs.filter(
      (pair): pair is FavoritePair =>
        Boolean(pair) &&
        typeof pair === 'object' &&
        isCurrencyCode(pair.from) &&
        isCurrencyCode(pair.to),
    );
  }

  if (Array.isArray(state.recentCurrencies)) {
    result.recentCurrencies = state.recentCurrencies
      .filter((code): code is string => typeof code === 'string')
      .slice(0, 5);
  }

  return result;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [language, setLanguage] = useState<Language>('ru');
  const [baseCurrency, setBaseCurrency] = useState<CurrencyCode>('USD');
  const [walletBalances, setWalletBalances] = useState<WalletBalance[]>([
    { id: '1', currency: 'USD', amount: 1500 },
    { id: '2', currency: 'EUR', amount: 800 },
    { id: '3', currency: 'ILS', amount: 5000 },
  ]);
  const [favoritePairs, setFavoritePairs] = useState<FavoritePair[]>([
    { from: 'USD', to: 'ILS' },
    { from: 'USD', to: 'EUR' },
    { from: 'EUR', to: 'ILS' },
  ]);
  const [recentCurrencies, setRecentCurrencies] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => {
        if (!isMounted) return;
        if (!value) {
          setNeedsOnboarding(true);
          return;
        }
        const saved = parsePersistedState(value);
        if (saved.onboardingCompleted === false) setNeedsOnboarding(true);
        if (saved.language) setLanguage(saved.language);
        if (saved.baseCurrency) setBaseCurrency(saved.baseCurrency);
        if (saved.walletBalances) setWalletBalances(saved.walletBalances);
        if (saved.favoritePairs) setFavoritePairs(saved.favoritePairs);
        if (saved.recentCurrencies) setRecentCurrencies(saved.recentCurrencies);
      })
      .catch((error) => console.warn('Unable to restore app state', error))
      .finally(() => {
        if (isMounted) setHasHydrated(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;

    const state: PersistedAppState = {
      language,
      baseCurrency,
      walletBalances,
      favoritePairs,
      recentCurrencies,
      onboardingCompleted: !needsOnboarding,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch((error) =>
      console.warn('Unable to save app state', error),
    );
  }, [
    hasHydrated,
    language,
    baseCurrency,
    walletBalances,
    favoritePairs,
    recentCurrencies,
    needsOnboarding,
  ]);

  if (!hasHydrated) return null;

  const addRecentCurrency = (code: string) => {
    setRecentCurrencies((prev) =>
      [code, ...prev.filter((item) => item !== code)].slice(0, 5),
    );
  };

  const completeOnboarding = (currency: CurrencyCode) => {
    setBaseCurrency(currency);
    setNeedsOnboarding(false);
  };

  const convert = (
    amount: number,
    from: CurrencyCode,
    to: CurrencyCode,
  ): number => {
    const fromRate = CURRENCIES[from].rateToUSD;
    const toRate = CURRENCIES[to].rateToUSD;
    return (amount * toRate) / fromRate;
  };

  const addBalance = (currency: CurrencyCode, amount: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setWalletBalances((prev) => [...prev, { id, currency, amount }]);
  };

  const updateBalance = (id: string, amount: number) => {
    setWalletBalances((prev) =>
      prev.map((b) => (b.id === id ? { ...b, amount } : b)),
    );
  };

  const removeBalance = (id: string) => {
    setWalletBalances((prev) => prev.filter((b) => b.id !== id));
  };

  const toggleFavoritePair = (from: CurrencyCode, to: CurrencyCode) => {
    setFavoritePairs((prev) => {
      const exists = prev.some((p) => p.from === from && p.to === to);
      if (exists) return prev.filter((p) => !(p.from === from && p.to === to));
      return [...prev, { from, to }];
    });
  };

  const isFavoritePair = (from: CurrencyCode, to: CurrencyCode): boolean => {
    return favoritePairs.some((p) => p.from === from && p.to === to);
  };

  const formatAmount = (amount: number): string => {
    if (amount >= 1000000) return (amount / 1000000).toFixed(2) + 'M';
    if (amount >= 1000) {
      const parts = amount.toFixed(2).split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return parts.join('.');
    }
    return amount.toFixed(2);
  };

  const getCurrencyName = (code: CurrencyCode): string => {
    const c = CURRENCIES[code];
    if (language === 'en') return c.nameEn;
    if (language === 'he') return c.nameHe;
    return c.nameRu;
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        currencies: CURRENCIES,
        walletBalances,
        addBalance,
        updateBalance,
        removeBalance,
        baseCurrency,
        setBaseCurrency,
        needsOnboarding,
        completeOnboarding,
        convert,
        formatAmount,
        getCurrencyName,
        favoritePairs,
        toggleFavoritePair,
        isFavoritePair,
        recentCurrencies,
        addRecentCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}

export { CURRENCIES };
