import { CURRENCY_MAP } from './currencies.ts';

export const DEFAULT_ACTIVE_CURRENCY = 'USD';
export const CONVERTER_PREFERENCES_VERSION = 3;
export const DEFAULT_CURRENCY_SET = ['ILS', 'USD', 'EUR', 'GBP', 'CAD', 'CHF', 'AED', 'UAH', 'JPY'];
export const DEFAULT_TARGET_CURRENCIES = DEFAULT_CURRENCY_SET.filter(
  (code) => code !== DEFAULT_ACTIVE_CURRENCY,
);

export function isCurrencyCode(value: unknown): value is string {
  return typeof value === 'string' && Boolean(CURRENCY_MAP[value]);
}

function validTargetCurrencies(activeCurrency: string, targetValue: unknown): string[] {
  if (!Array.isArray(targetValue)) return [];
  return targetValue.filter(
    (code, index): code is string =>
      isCurrencyCode(code) && code !== activeCurrency && targetValue.indexOf(code) === index,
  );
}

export function migrateConverterCurrencies(
  versionValue: unknown,
  activeValue: unknown,
  targetValue: unknown,
) {
  const activeCurrency = isCurrencyCode(activeValue) ? activeValue : DEFAULT_ACTIVE_CURRENCY;
  if (versionValue === CONVERTER_PREFERENCES_VERSION) {
    return {
      version: CONVERTER_PREFERENCES_VERSION,
      ...normalizeConverterCurrencies(activeCurrency, targetValue),
    };
  }

  if (versionValue === 2) {
    const legacyTargets = validTargetCurrencies(activeCurrency, targetValue);
    if (legacyTargets.length >= 4) {
      return {
        version: CONVERTER_PREFERENCES_VERSION,
        activeCurrency,
        targetCurrencies: legacyTargets,
      };
    }
  }

  const targets = DEFAULT_CURRENCY_SET.filter((code) => code !== activeCurrency);
  return {
    version: CONVERTER_PREFERENCES_VERSION,
    activeCurrency,
    targetCurrencies: targets.length ? targets : DEFAULT_TARGET_CURRENCIES,
  };
}

export function normalizeConverterCurrencies(activeValue: unknown, targetValue: unknown) {
  const activeCurrency = isCurrencyCode(activeValue) ? activeValue : DEFAULT_ACTIVE_CURRENCY;
  const candidates = Array.isArray(targetValue) ? targetValue : DEFAULT_TARGET_CURRENCIES;
  const targetCurrencies = validTargetCurrencies(activeCurrency, candidates);
  if (targetCurrencies.length) return { activeCurrency, targetCurrencies };

  const fallback = DEFAULT_TARGET_CURRENCIES.find((code) => code !== activeCurrency)
    ?? Object.keys(CURRENCY_MAP).find((code) => code !== activeCurrency)!;
  return { activeCurrency, targetCurrencies: [fallback] };
}
