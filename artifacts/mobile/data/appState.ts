import { CURRENCY_MAP } from './currencies';

export const DEFAULT_ACTIVE_CURRENCY = 'USD';
export const DEFAULT_TARGET_CURRENCIES = ['EUR', 'ILS', 'GBP'];

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && Boolean(CURRENCY_MAP[value]);
}

export function normalizeConverterCurrencies(activeValue: unknown, targetValue: unknown) {
  const activeCurrency = isCurrencyCode(activeValue) ? activeValue : DEFAULT_ACTIVE_CURRENCY;
  const candidates = Array.isArray(targetValue) ? targetValue : DEFAULT_TARGET_CURRENCIES;
  const targetCurrencies = candidates.filter(
    (code, index): code is string =>
      isCurrencyCode(code) && code !== activeCurrency && candidates.indexOf(code) === index,
  );
  if (targetCurrencies.length) return { activeCurrency, targetCurrencies };

  const fallback = DEFAULT_TARGET_CURRENCIES.find((code) => code !== activeCurrency)
    ?? Object.keys(CURRENCY_MAP).find((code) => code !== activeCurrency)!;
  return { activeCurrency, targetCurrencies: [fallback] };
}

