import React, { useMemo, useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CurrencyPicker from '@/components/CurrencyPicker';
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
    content: { paddingTop: insets.top + 8, paddingBottom: Platform.OS === 'web' ? 94 : 102 },
    header: { paddingHorizontal: 16 },
    title: { fontFamily: 'Inter_700Bold', fontSize: 27, color: colors.foreground, textAlign },
    source: { marginTop: 12, borderRadius: 16, padding: 14, backgroundColor: colors.primary },
    sourceTop: { flexDirection: direction, alignItems: 'center', justifyContent: 'space-between' },
    sourceLabel: { color: 'rgba(255,255,255,.72)', fontFamily: 'Inter_500Medium', fontSize: 12 },
    sourceButton: { minHeight: 44, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,.14)',
      flexDirection: direction, alignItems: 'center', gap: 7 },
    flag: { fontSize: 22 },
    sourceCode: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 17 },
    input: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 36, minHeight: 52, paddingVertical: 2, textAlign },
    status: { flexDirection: direction, alignItems: 'center', gap: 6, marginTop: 4 },
    statusText: { color: 'rgba(255,255,255,.75)', fontFamily: 'Inter_400Regular', fontSize: 11, flexShrink: 1, textAlign },
    headingRow: { minHeight: 54, paddingHorizontal: 16, flexDirection: direction, alignItems: 'center', justifyContent: 'space-between' },
    heading: { fontFamily: 'Inter_700Bold', fontSize: 18, color: colors.foreground },
    add: { minHeight: 44, paddingHorizontal: 8, flexDirection: direction, alignItems: 'center', gap: 4 },
    addText: { fontFamily: 'Inter_600SemiBold', color: colors.primary, fontSize: 14 },
    list: { marginHorizontal: 12, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    row: { height: 82, paddingStart: 12, flexDirection: direction, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
    lastRow: { borderBottomWidth: 0 },
    identity: { width: 102, flexDirection: direction, alignItems: 'center', gap: 8 },
    identityText: { flex: 1 },
    code: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.foreground, textAlign },
    name: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground, marginTop: 2, textAlign },
    value: { flex: 1, alignItems: isRTL ? 'flex-start' : 'flex-end', paddingHorizontal: 6 },
    result: { width: '100%', fontFamily: 'Inter_700Bold', fontSize: 23, color: colors.foreground, textAlign: isRTL ? 'left' : 'right' },
    rate: { width: '100%', fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.mutedForeground, marginTop: 4, textAlign: isRTL ? 'left' : 'right' },
    remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
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
              <Text style={s.flag}>{CURRENCY_MAP[activeCurrency].flag}</Text><Text style={s.sourceCode}>{activeCurrency}</Text>
              <Ionicons name="chevron-down" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <TextInput value={amount} onChangeText={setAmount} keyboardType="decimal-pad" style={s.input} maxLength={16}
            accessibilityLabel={t('amountInput')} selectTextOnFocus />
          <View style={s.status}><Ionicons name="information-circle-outline" size={14} color="rgba(255,255,255,.72)" />
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
          <View style={s.identity}><Text style={s.flag}>{currency.flag}</Text><View style={s.identityText}>
            <Text style={s.code}>{code}</Text><Text style={s.name} numberOfLines={1}>{getCurrencyName(code)}</Text></View></View>
          <View style={s.value}><Text style={s.result} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={.58}>
            {result.toLocaleString(undefined, { maximumFractionDigits: decimals(result) })}</Text>
            <Text style={s.rate} numberOfLines={1} adjustsFontSizeToFit>1 {activeCurrency} = {rate.toLocaleString(undefined, { maximumFractionDigits: decimals(rate) })} {code}</Text></View>
          <TouchableOpacity style={s.remove} onPress={() => removeTarget(code)} disabled={targetCurrencies.length === 1}
            accessibilityRole="button" accessibilityLabel={`${t('removeCurrency')} ${getCurrencyName(code)}`}>
            <Ionicons name="ellipsis-horizontal" size={22} color={targetCurrencies.length === 1 ? colors.border : colors.mutedForeground} />
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
              <Text style={s.flag}>{currency.flag}</Text><View style={s.catalogName}><Text style={s.code}>{currency.code}</Text>
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
