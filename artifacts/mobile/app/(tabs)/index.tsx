import React, { useMemo, useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CurrencyPicker from '@/components/CurrencyPicker';
import { ALL_CURRENCIES, CurrencyInfo } from '@/data/currencies';
import { useAppContext } from '@/context/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

function decimals(value: number) {
  if (Math.abs(value) >= 1000) return 0;
  if (Math.abs(value) >= 1) return 2;
  return 4;
}

export default function HomeScreen() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const t = useTranslation();
  const { activeCurrency, setActiveCurrency, targetCurrencies, setTargetCurrencies,
    convert, getCurrencyName, language } = useAppContext();
  const [amount, setAmount] = useState('100');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [query, setQuery] = useState('');
  const numericAmount = Number(amount.replace(',', '.')) || 0;
  const isRTL = language === 'he';
  const bottom = Platform.OS === 'web' ? 100 : 90 + insets.bottom;

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return ALL_CURRENCIES.filter((currency) => currency.code !== activeCurrency && (!q ||
      currency.code.toLocaleLowerCase().includes(q) ||
      (language === 'ru' ? currency.nameRu : language === 'he' ? currency.nameHe : currency.nameEn)
        .toLocaleLowerCase().includes(q)));
  }, [activeCurrency, language, query]);

  const toggleTarget = (code: string) => {
    const selected = targetCurrencies.includes(code);
    if (selected && targetCurrencies.length === 1) return;
    Haptics.selectionAsync();
    setTargetCurrencies(selected
      ? targetCurrencies.filter((item) => item !== code)
      : [...targetCurrencies, code]);
  };

  const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { paddingHorizontal: 16, paddingTop: insets.top + 12, paddingBottom: bottom },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: colors.foreground, textAlign: isRTL ? 'right' : 'left' },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.mutedForeground, marginTop: 4, textAlign: isRTL ? 'right' : 'left' },
    source: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', marginTop: 22, borderRadius: 20,
      padding: 18, minHeight: 132, backgroundColor: colors.primary, gap: 12 },
    sourceCurrency: { minWidth: 86, minHeight: 54, borderRadius: 14, backgroundColor: 'rgba(255,255,255,.15)',
      alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7 },
    flag: { fontSize: 23 }, code: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 17 },
    inputWrap: { flex: 1 }, inputLabel: { color: 'rgba(255,255,255,.72)', fontFamily: 'Inter_500Medium', fontSize: 12,
      textAlign: isRTL ? 'right' : 'left' },
    input: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 38, paddingVertical: 4, textAlign: isRTL ? 'right' : 'left', minHeight: 55 },
    headingRow: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 8 },
    heading: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.foreground },
    manage: { minHeight: 44, paddingHorizontal: 12, justifyContent: 'center' },
    manageText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 14 },
    card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 10 },
    row: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 },
    meta: { flex: 1 }, currencyName: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, marginTop: 2,
      textAlign: isRTL ? 'right' : 'left' },
    targetCode: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.foreground, textAlign: isRTL ? 'right' : 'left' },
    result: { maxWidth: '52%', fontFamily: 'Inter_700Bold', fontSize: 25, color: colors.foreground, textAlign: isRTL ? 'left' : 'right' },
    rate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, marginTop: 12, textAlign: isRTL ? 'right' : 'left' },
    notice: { fontFamily: 'Inter_400Regular', color: colors.mutedForeground, fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: isRTL ? 'right' : 'left' },
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: { height: '88%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 14, paddingBottom: insets.bottom },
    modalHeader: { minHeight: 52, paddingHorizontal: 16, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.foreground },
    done: { minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    search: { minHeight: 48, marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 14, borderRadius: 13, backgroundColor: colors.muted,
      color: colors.foreground, fontFamily: 'Inter_400Regular', textAlign: isRTL ? 'right' : 'left' },
    list: { paddingHorizontal: 16, paddingBottom: 20 },
    currencyRow: { minHeight: 58, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    rowName: { flex: 1 }, disabled: { opacity: .45 },
    limit: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, paddingHorizontal: 16, textAlign: isRTL ? 'right' : 'left' },
  });

  return <View style={s.page}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <Text style={s.title}>{t('multiConverter')}</Text>
      <Text style={s.subtitle}>{t('instantConversion')}</Text>
      <View style={s.source}>
        <TouchableOpacity style={s.sourceCurrency} onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel={t('changeActiveCurrency')}>
          <Text style={s.flag}>{ALL_CURRENCIES.find(c => c.code === activeCurrency)?.flag}</Text>
          <Text style={s.code}>{activeCurrency}</Text><Ionicons name="chevron-down" size={16} color="#fff" />
        </TouchableOpacity>
        <View style={s.inputWrap}><Text style={s.inputLabel}>{t('amount')}</Text>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={s.input} maxLength={16}
            accessibilityLabel={t('amountInput')} selectTextOnFocus /></View>
      </View>
      <View style={s.headingRow}><Text style={s.heading}>{t('yourCurrencies')}</Text>
        <TouchableOpacity style={s.manage} onPress={() => setManageOpen(true)} accessibilityRole="button" accessibilityLabel={t('manageCurrencies')}><Text style={s.manageText}>{t('manage')}</Text></TouchableOpacity></View>
      {targetCurrencies.map(code => {
        const currency = ALL_CURRENCIES.find(c => c.code === code)!;
        const result = convert(numericAmount, activeCurrency, code);
        const rate = convert(1, activeCurrency, code);
        return <View style={s.card} key={code}>
          <View style={s.row}><Text style={s.flag}>{currency.flag}</Text><View style={s.meta}><Text style={s.targetCode}>{code}</Text>
            <Text style={s.currencyName} numberOfLines={1}>{getCurrencyName(code)}</Text></View>
            <Text style={s.result} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.65}>{result.toLocaleString(undefined, { maximumFractionDigits: decimals(result) })}</Text></View>
          <Text style={s.rate}>1 {activeCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: decimals(rate) })} {code}</Text>
        </View>;
      })}
      <Text style={s.notice}>{t('testRatesNotice')}</Text>
    </ScrollView>
    <CurrencyPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} currentCode={activeCurrency}
      onSelect={setActiveCurrency} title={t('activeCurrency')} />
    <Modal visible={manageOpen} transparent animationType="slide" onRequestClose={() => setManageOpen(false)}>
      <View style={s.overlay}><View style={s.sheet}>
        <View style={s.modalHeader}><Text style={s.modalTitle}>{t('manageCurrencies')}</Text><TouchableOpacity style={s.done} onPress={() => setManageOpen(false)}><Text style={s.manageText}>{t('done')}</Text></TouchableOpacity></View>
        <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder={t('searchCurrencies')} placeholderTextColor={colors.mutedForeground}
          accessibilityLabel={t('searchCurrencies')} autoCorrect={false} />
        <Text style={s.limit}>{targetCurrencies.length === 1 ? t('oneCurrencyRequired') : t('tapToAddRemove')}</Text>
        <ScrollView contentContainerStyle={s.list} keyboardShouldPersistTaps="handled">
          {filtered.length ? filtered.map((currency: CurrencyInfo) => {
            const selected = targetCurrencies.includes(currency.code); const blocked = selected && targetCurrencies.length === 1;
            return <TouchableOpacity key={currency.code} style={[s.currencyRow, blocked && s.disabled]} onPress={() => toggleTarget(currency.code)} disabled={blocked}
              accessibilityRole="checkbox" accessibilityState={{ checked: selected, disabled: blocked }} accessibilityLabel={`${selected ? t('removeCurrency') : t('addCurrencyLabel')} ${getCurrencyName(currency.code)}`}>
              <Text style={s.flag}>{currency.flag}</Text><View style={s.rowName}><Text style={s.targetCode}>{currency.code}</Text><Text style={s.currencyName} numberOfLines={1}>{getCurrencyName(currency.code)}</Text></View>
              <Ionicons name={selected ? 'checkmark-circle' : 'add-circle-outline'} size={24} color={selected ? colors.primary : colors.mutedForeground} />
            </TouchableOpacity>;
          }) : <Text style={s.notice}>{t('noSearchResults')}</Text>}
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
}
