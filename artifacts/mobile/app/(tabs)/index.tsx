import React, { useMemo, useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CurrencyPicker from '@/components/CurrencyPicker';
import CurrencyFlag from '@/components/CurrencyFlag';
import { ALL_CURRENCIES, CURRENCY_MAP } from '@/data/currencies';
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
  const {
    activeCurrency, setActiveCurrency, targetCurrencies, setTargetCurrencies,
    convert, getCurrencyName, language,
  } = useAppContext();
  const [amount, setAmount] = useState('100');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [amountFocused, setAmountFocused] = useState(false);
  const numericAmount = Number(amount.replace(',', '.')) || 0;
  const isRTL = language === 'he';

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();
    return ALL_CURRENCIES.filter((currency) => currency.code !== activeCurrency && (!q ||
      currency.code.toLocaleLowerCase().includes(q) ||
      currency.nameRu.toLocaleLowerCase().includes(q) ||
      currency.nameEn.toLocaleLowerCase().includes(q) ||
      currency.nameHe.toLocaleLowerCase().includes(q)));
  }, [activeCurrency, query]);

  const toggleTarget = (code: string) => {
    const selected = targetCurrencies.includes(code);
    if (selected && targetCurrencies.length === 1) return;
    Haptics.selectionAsync();
    setTargetCurrencies(selected
      ? targetCurrencies.filter((item) => item !== code)
      : [...targetCurrencies, code]);
  };

  const removeTarget = (code: string) => {
    if (targetCurrencies.length === 1) return;
    Haptics.selectionAsync();
    setTargetCurrencies(targetCurrencies.filter((item) => item !== code));
  };

  const direction = isRTL ? 'row-reverse' as const : 'row' as const;
  const textAlign = isRTL ? 'right' as const : 'left' as const;
  const s = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    content: { paddingTop: insets.top + 6, paddingBottom: Platform.OS === 'web' ? 94 : 102 },
    header: { paddingHorizontal: 16 },
    title: { fontFamily: 'Inter_700Bold', fontSize: 26, color: colors.foreground, textAlign },
    source: { marginTop: 8, borderRadius: 16, padding: 12, backgroundColor: colors.card,
      borderWidth: 1, borderColor: amountFocused ? colors.primary : colors.border },
    sourceTop: { flexDirection: direction, alignItems: 'center', justifyContent: 'space-between' },
    sourceLabel: { color: colors.mutedForeground, fontFamily: 'Inter_500Medium', fontSize: 11 },
    sourceButton: { minHeight: 36, paddingHorizontal: 9, borderRadius: 10, backgroundColor: colors.secondary,
      flexDirection: direction, alignItems: 'center', gap: 7 },
    flagBox: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.card },
    rowFlagBox: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
      backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
    sourceCode: { color: colors.primary, fontFamily: 'Inter_700Bold', fontSize: 15 },
    input: { color: colors.foreground, fontFamily: 'Inter_700Bold', fontSize: 32, minHeight: 44, paddingVertical: 0, textAlign },
    status: { flexDirection: direction, alignItems: 'center', gap: 5, marginTop: 1 },
    statusText: { color: colors.mutedForeground, fontFamily: 'Inter_400Regular', fontSize: 10, flexShrink: 1, textAlign },
    headingRow: { minHeight: 44, paddingHorizontal: 16, flexDirection: direction, alignItems: 'center', justifyContent: 'space-between' },
    heading: { fontFamily: 'Inter_700Bold', fontSize: 17, color: colors.foreground },
    add: { minHeight: 36, paddingHorizontal: 6, flexDirection: direction, alignItems: 'center', gap: 4 },
    addText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 14 },
    list: { marginHorizontal: 12, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    row: { height: 64, paddingHorizontal: 10, flexDirection: direction, alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    lastRow: { borderBottomWidth: 0 },
    identity: { flex: 1, minWidth: 0, flexDirection: direction, alignItems: 'center', gap: 9 },
    identityText: { flex: 1, minWidth: 0 },
    code: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.foreground, textAlign },
    name: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground, marginTop: 2, textAlign },
    value: { flex: 1.15, minWidth: 0, alignItems: isRTL ? 'flex-start' : 'flex-end', paddingHorizontal: 8 },
    result: { width: '100%', fontFamily: 'Inter_600SemiBold', fontSize: 21, color: colors.foreground, textAlign: isRTL ? 'left' : 'right' },
    rate: { width: '100%', fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.mutedForeground, marginTop: 2, textAlign: isRTL ? 'left' : 'right' },
    remove: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted },
    footerAdd: { minHeight: 50, marginHorizontal: 16, marginTop: 8, borderRadius: 12, borderWidth: 1, borderColor: colors.border,
      alignItems: 'center', justifyContent: 'center', flexDirection: direction, gap: 6 },
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: { height: '90%', backgroundColor: colors.background, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 10, paddingBottom: insets.bottom },
    modalHeader: { minHeight: 52, paddingHorizontal: 16, flexDirection: direction, alignItems: 'center', justifyContent: 'space-between' },
    modalTitle: { fontFamily: 'Inter_700Bold', fontSize: 20, color: colors.foreground },
    done: { minWidth: 56, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
    search: { minHeight: 48, marginHorizontal: 16, marginVertical: 8, paddingHorizontal: 14, borderRadius: 13, backgroundColor: colors.muted,
      color: colors.foreground, fontFamily: 'Inter_400Regular', textAlign },
    hint: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, paddingHorizontal: 16, textAlign },
    catalog: { paddingHorizontal: 16, paddingBottom: 20 },
    catalogRow: { minHeight: 60, flexDirection: direction, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    catalogName: { flex: 1 }, disabled: { opacity: .45 }, empty: { color: colors.mutedForeground, marginTop: 20, textAlign: 'center' },
  });

  return <View style={s.page}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <Text style={s.title}>{t('multiConverter')}</Text>
        <View style={s.source}>
          <View style={s.sourceTop}>
            <Text style={s.sourceLabel}>{t('activeCurrency')}</Text>
            <TouchableOpacity style={s.sourceButton} onPress={() => setPickerOpen(true)} accessibilityRole="button" accessibilityLabel={t('changeActiveCurrency')}>
              <View style={s.flagBox}><CurrencyFlag flag={CURRENCY_MAP[activeCurrency].flag} size={20} /></View>
              <Text style={s.sourceCode}>{activeCurrency}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <TextInput value={amount} onChangeText={setAmount} onFocus={() => setAmountFocused(true)} onBlur={() => setAmountFocused(false)}
            keyboardType="decimal-pad" style={s.input} maxLength={16} selectionColor={colors.primary}
            accessibilityLabel={t('amountInput')} selectTextOnFocus />
          <View style={s.status}><Ionicons name="information-circle-outline" size={13} color={colors.mutedForeground} />
            <Text style={s.statusText}>{t('referenceRatesStatus')}</Text></View>
        </View>
      </View>
      <View style={s.headingRow}><Text style={s.heading}>{t('yourCurrencies')}</Text>
        <TouchableOpacity style={s.add} onPress={() => setManageOpen(true)} accessibilityRole="button">
          <Ionicons name="add-circle" size={20} color={colors.primary} /><Text style={s.addText}>{t('addCurrencyLabel')}</Text>
        </TouchableOpacity></View>
      <View style={s.list}>{targetCurrencies.map((code, index) => {
        const currency = CURRENCY_MAP[code];
        const result = convert(numericAmount, activeCurrency, code);
        const rate = convert(1, activeCurrency, code);
        return <View style={[s.row, index === targetCurrencies.length - 1 && s.lastRow]} key={code}>
          <View style={s.identity}><View style={s.rowFlagBox}><CurrencyFlag flag={currency.flag} size={22} /></View><View style={s.identityText}>
            <Text style={s.code}>{code}</Text><Text style={s.name} numberOfLines={1}>{getCurrencyName(code)}</Text></View></View>
          <View style={s.value}><Text style={s.result} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.58}>
            {result.toLocaleString(undefined, { maximumFractionDigits: decimals(result) })}</Text>
            <Text style={s.rate} numberOfLines={1} adjustsFontSizeToFit>1 {activeCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: decimals(rate) })} {code}</Text></View>
          <TouchableOpacity style={s.remove} onPress={() => removeTarget(code)} disabled={targetCurrencies.length === 1}
            accessibilityRole="button" accessibilityLabel={`${t('removeCurrency')} ${getCurrencyName(code)}`}>
            <Ionicons name="close-circle-outline" size={20} color={targetCurrencies.length === 1 ? colors.border : colors.mutedForeground} />
          </TouchableOpacity>
        </View>;
      })}</View>
      <TouchableOpacity style={s.footerAdd} onPress={() => setManageOpen(true)} accessibilityRole="button">
        <Ionicons name="add" size={20} color={colors.primary} /><Text style={s.addText}>{t('addCurrencyLabel')}</Text>
      </TouchableOpacity>
    </ScrollView>
    <CurrencyPicker visible={pickerOpen} onClose={() => setPickerOpen(false)} currentCode={activeCurrency}
      onSelect={setActiveCurrency} title={t('activeCurrency')} />
    <Modal visible={manageOpen} transparent animationType="slide" onRequestClose={() => setManageOpen(false)}>
      <View style={s.overlay}><View style={s.sheet}>
        <View style={s.modalHeader}><Text style={s.modalTitle}>{t('manageCurrencies')}</Text>
          <TouchableOpacity style={s.done} onPress={() => setManageOpen(false)}><Text style={s.addText}>{t('done')}</Text></TouchableOpacity></View>
        <TextInput style={s.search} value={query} onChangeText={setQuery} placeholder={t('searchCurrencies')}
          placeholderTextColor={colors.mutedForeground} accessibilityLabel={t('searchCurrencies')} autoCorrect={false} />
        <Text style={s.hint}>{targetCurrencies.length === 1 ? t('oneCurrencyRequired') : t('tapToAddRemove')}</Text>
        <ScrollView contentContainerStyle={s.catalog} keyboardShouldPersistTaps="handled">
          {filtered.length ? filtered.map((currency) => {
            const selected = targetCurrencies.includes(currency.code);
            const blocked = selected && targetCurrencies.length === 1;
            return <TouchableOpacity key={currency.code} style={[s.catalogRow, blocked && s.disabled]}
              onPress={() => toggleTarget(currency.code)} disabled={blocked} accessibilityRole="checkbox"
              accessibilityState={{ checked: selected, disabled: blocked }}>
              <View style={s.rowFlagBox}><CurrencyFlag flag={currency.flag} size={22} /></View><View style={s.catalogName}><Text style={s.code}>{currency.code}</Text>
                <Text style={s.name} numberOfLines={1}>{getCurrencyName(currency.code)}</Text></View>
              <Ionicons name={selected ? 'checkmark-circle' : 'add-circle-outline'} size={25}
                color={selected ? colors.primary : colors.mutedForeground} />
            </TouchableOpacity>;
          }) : <Text style={s.empty}>{t('noSearchResults')}</Text>}
        </ScrollView>
      </View></View>
    </Modal>
  </View>;
}
