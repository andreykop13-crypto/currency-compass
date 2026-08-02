import React, { createContext, useContext, useState } from 'react';

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
    code: 'USD', symbol: '$',
    nameRu: 'Доллар США', nameEn: 'US Dollar', nameHe: 'דולר אמריקאי',
    rateToUSD: 1.0, change24h: 0,
  },
  EUR: {
    code: 'EUR', symbol: '€',
    nameRu: 'Евро', nameEn: 'Euro', nameHe: 'יורו',
    rateToUSD: 0.925, change24h: 0.12,
  },
  ILS: {
    code: 'ILS', symbol: '₪',
    nameRu: 'Израильский шекель', nameEn: 'Israeli Shekel', nameHe: 'שקל ישראלי',
    rateToUSD: 3.67, change24h: -0.43,
  },
  RUB: {
    code: 'RUB', symbol: '₽',
    nameRu: 'Российский рубль', nameEn: 'Russian Ruble', nameHe: 'רובל רוסי',
    rateToUSD: 90.5, change24h: 0.85,
  },
  BYN: {
    code: 'BYN', symbol: 'Br',
    nameRu: 'Белорусский рубль', nameEn: 'Belarusian Ruble', nameHe: 'רובל בלרוסי',
    rateToUSD: 3.27, change24h: 0.22,
  },
};

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
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

  const addRecentCurrency = (code: string) => {
    setRecentCurrencies(prev => [code, ...prev.filter(item => item !== code)].slice(0, 5));
  };

  const convert = (amount: number, from: CurrencyCode, to: CurrencyCode): number => {
    const fromRate = CURRENCIES[from].rateToUSD;
    const toRate = CURRENCIES[to].rateToUSD;
    return amount * toRate / fromRate;
  };

  const addBalance = (currency: CurrencyCode, amount: number) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    setWalletBalances(prev => [...prev, { id, currency, amount }]);
  };

  const updateBalance = (id: string, amount: number) => {
    setWalletBalances(prev => prev.map(b => b.id === id ? { ...b, amount } : b));
  };

  const removeBalance = (id: string) => {
    setWalletBalances(prev => prev.filter(b => b.id !== id));
  };

  const toggleFavoritePair = (from: CurrencyCode, to: CurrencyCode) => {
    setFavoritePairs(prev => {
      const exists = prev.some(p => p.from === from && p.to === to);
      if (exists) return prev.filter(p => !(p.from === from && p.to === to));
      return [...prev, { from, to }];
    });
  };

  const isFavoritePair = (from: CurrencyCode, to: CurrencyCode): boolean => {
    return favoritePairs.some(p => p.from === from && p.to === to);
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
    <AppContext.Provider value={{
      language, setLanguage,
      currencies: CURRENCIES,
      walletBalances, addBalance, updateBalance, removeBalance,
      baseCurrency, setBaseCurrency,
      convert, formatAmount, getCurrencyName,
      favoritePairs, toggleFavoritePair, isFavoritePair,
      recentCurrencies, addRecentCurrency,
    }}>
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
