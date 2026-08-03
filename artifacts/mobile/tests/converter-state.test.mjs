import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ALL_CURRENCIES,
  CURRENCY_MAP,
  NEUTRAL_CURRENCY_ICON,
  NEUTRAL_ICON_CODES,
} from '../data/currencies.ts';
import {
  CONVERTER_PREFERENCES_VERSION,
  DEFAULT_CURRENCY_SET,
  migrateConverterCurrencies,
  normalizeConverterCurrencies,
} from '../data/appState.ts';

test('every catalog currency has a flag or an explicitly allowed neutral icon', () => {
  const neutralCodes = new Set(NEUTRAL_ICON_CODES);
  assert.ok(ALL_CURRENCIES.length >= 150);
  for (const currency of ALL_CURRENCIES) {
    assert.ok(currency.flag.trim(), `${currency.code} has no flag/icon`);
    assert.equal(
      currency.flag === NEUTRAL_CURRENCY_ICON,
      neutralCodes.has(currency.code),
      `${currency.code} has the wrong national/neutral treatment`,
    );
  }
});

test('key currencies use their exact national or union flags', () => {
  assert.deepEqual(
    Object.fromEntries(['ILS', 'USD', 'EUR', 'GBP', 'CAD', 'CHF', 'AED', 'UAH', 'JPY'].map((code) => [code, CURRENCY_MAP[code].flag])),
    { ILS: '🇮🇱', USD: '🇺🇸', EUR: '🇪🇺', GBP: '🇬🇧', CAD: '🇨🇦', CHF: '🇨🇭', AED: '🇦🇪', UAH: '🇺🇦', JPY: '🇯🇵' },
  );
  for (const code of NEUTRAL_ICON_CODES) assert.equal(CURRENCY_MAP[code].flag, NEUTRAL_CURRENCY_ICON);
});

test('version 2 short preferences migrate once to the version 3 default set', () => {
  const migrated = migrateConverterCurrencies(2, 'USD', ['EUR', 'GBP']);
  assert.equal(CONVERTER_PREFERENCES_VERSION, 3);
  assert.deepEqual(DEFAULT_CURRENCY_SET, ['ILS', 'USD', 'EUR', 'GBP', 'CAD', 'CHF', 'AED', 'UAH', 'JPY']);
  assert.deepEqual(migrated, {
    version: 3,
    activeCurrency: 'USD',
    targetCurrencies: ['ILS', 'EUR', 'GBP', 'CAD', 'CHF', 'AED', 'UAH', 'JPY'],
  });
});

test('version 2 long custom preferences are preserved while upgrading', () => {
  assert.deepEqual(migrateConverterCurrencies(2, 'USD', ['EUR', 'ILS', 'JPY', 'CAD']), {
    version: 3,
    activeCurrency: 'USD',
    targetCurrencies: ['EUR', 'ILS', 'JPY', 'CAD'],
  });
});

test('version 3 intentional short preferences remain unchanged', () => {
  assert.deepEqual(migrateConverterCurrencies(3, 'USD', ['EUR']), {
    version: 3,
    activeCurrency: 'USD',
    targetCurrencies: ['EUR'],
  });
});

test('normalization filters active and duplicate targets', () => {
  assert.deepEqual(normalizeConverterCurrencies('USD', ['USD', 'EUR', 'EUR', 'ILS']), {
    activeCurrency: 'USD',
    targetCurrencies: ['EUR', 'ILS'],
  });
});

test('normalization can never leave the converter without a target', () => {
  const normalized = normalizeConverterCurrencies('USD', ['USD', 'not-a-code']);
  assert.equal(normalized.targetCurrencies.length, 1);
  assert.notEqual(normalized.targetCurrencies[0], 'USD');
});
