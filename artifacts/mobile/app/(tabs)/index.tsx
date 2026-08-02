import React, { useMemo, useState } from 'react';
import {
  Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { CurrencyCode, Language, useAppContext } from '@/context/AppContext';

const CODES: CurrencyCode[] = ['USD', 'EUR', 'ILS', 'RUB', 'BYN'];
const SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', ILS: '₪', RUB: '₽', BYN: 'Br' };
const POPULAR: CurrencyCode[] = ['USD', 'EUR', 'ILS', 'RUB'];
const LANGS: Array<{ code: Language; label: string }> = [
  { code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }, { code: 'he', label: 'עברית' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useTranslation();
  const router = useRouter();
  const { currencies, convert, formatAmount, language, setLanguage, favoritePairs, baseCurrency } = useAppContext();
  const [amountText, setAmountText] = useState('100');
  const [from, setFrom] = useState<CurrencyCode>(baseCurrency);
  const [to, setTo] = useState<CurrencyCode>(baseCurrency === 'USD' ? 'EUR' : 'USD');
  const [picker, setPicker] = useState<'from' | 'to' | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [recentPairs, setRecentPairs] = useState<Array<{ from: CurrencyCode; to: CurrencyCode }>>([]);
  const isWeb = Platform.OS === 'web';
  const amount = Number(amountText.replace(',', '.').replace(/[^0-9.]/g, '')) || 0;
  const rate = convert(1, from, to);
  const result = amount * rate;

  const shownPairs = useMemo(() => {
    return recentPairs.filter((pair, index, all) =>
      index === all.findIndex(item => item.from === pair.from && item.to === pair.to),
    ).slice(0, 3);
  }, [recentPairs]);

  const remember = (nextFrom: CurrencyCode, nextTo: CurrencyCode) => {
    setRecentPairs(current => [{ from: nextFrom, to: nextTo }, ...current].slice(0, 3));
  };
  const selectCurrency = (code: CurrencyCode) => {
    if (picker === 'from') {
      const nextTo = code === to ? from : to;
      setFrom(code); setTo(nextTo); remember(code, nextTo);
    } else {
      const nextFrom = code === from ? to : from;
      setTo(code); setFrom(nextFrom); remember(nextFrom, code);
    }
    setPicker(null);
  };
  const swap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setFrom(to); setTo(from); remember(to, from);
  };
  const applyPair = (nextFrom: CurrencyCode, nextTo: CurrencyCode) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFrom(nextFrom); setTo(nextTo); remember(nextFrom, nextTo);
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { paddingBottom: isWeb ? 110 : 112 },
    header: { paddingTop: (isWeb ? 67 : insets.top) + 8, paddingHorizontal: 20, paddingBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.foreground, letterSpacing: -0.7 },
    subtitle: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, marginTop: 2 },
    iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.secondary, alignItems: 'center', justifyContent: 'center' },
    converter: { marginHorizontal: 16, borderRadius: 24, padding: 18, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    fieldLabel: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.8 },
    inputRow: { minHeight: 64, flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    input: { flex: 1, minWidth: 0, fontSize: 38, fontFamily: 'Inter_700Bold', color: colors.foreground, letterSpacing: -1.2, paddingVertical: 4 },
    currencyButton: { minWidth: 84, minHeight: 48, paddingHorizontal: 12, borderRadius: 14, backgroundColor: colors.secondary, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center' },
    currencyCode: { fontSize: 16, fontFamily: 'Inter_700Bold', color: colors.primary },
    divider: { height: 1, backgroundColor: colors.border, marginVertical: 10 },
    swapButton: { position: 'absolute', right: 20, top: 91, zIndex: 2, width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.card },
    result: { flex: 1, fontSize: 36, fontFamily: 'Inter_700Bold', color: colors.accent, letterSpacing: -1.1 },
    meta: { marginTop: 10, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
    rate: { flex: 1, fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    updated: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground, textAlign: 'right' },
    sectionHeader: { marginTop: 22, marginBottom: 10, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sectionTitle: { fontSize: 17, fontFamily: 'Inter_700Bold', color: colors.foreground },
    sectionHint: { fontSize: 12, color: colors.mutedForeground, fontFamily: 'Inter_400Regular' },
    horizontal: { paddingHorizontal: 16, gap: 10 },
    pair: { minWidth: 140, minHeight: 68, padding: 13, borderRadius: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    pairTitle: { fontSize: 14, fontFamily: 'Inter_700Bold', color: colors.foreground },
    pairRate: { marginTop: 5, fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.mutedForeground },
    popularRow: { paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    popular: { minWidth: 70, minHeight: 48, paddingHorizontal: 14, borderRadius: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
    popularCode: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.foreground },
    secondary: { margin: 20, marginTop: 28, paddingTop: 18, borderTopWidth: 1, borderTopColor: colors.border, flexDirection: 'row', gap: 10 },
    secondaryButton: { flex: 1, minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, backgroundColor: colors.muted },
    secondaryText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.mutedForeground },
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12, paddingBottom: (isWeb ? 24 : insets.bottom + 16) },
    handle: { width: 36, height: 4, backgroundColor: colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: 12 },
    sheetTitle: { fontSize: 18, fontFamily: 'Inter_700Bold', color: colors.foreground, paddingHorizontal: 20, paddingBottom: 10 },
    pickerRow: { minHeight: 56, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: colors.border, gap: 12 },
    pickerSymbol: { width: 32, fontSize: 20, color: colors.mutedForeground },
    pickerName: { flex: 1, fontSize: 15, fontFamily: 'Inter_500Medium', color: colors.foreground },
    done: { minHeight: 48, paddingHorizontal: 20, justifyContent: 'center' },
    doneText: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.primary, textAlign: 'right' },
  });

  return <View style={s.container}>
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
      <View style={s.header}>
        <View><Text style={s.title}>{t('converterTitle')}</Text><Text style={s.subtitle}>{t('converterSubtitle')}</Text></View>
        <TouchableOpacity style={s.iconButton} onPress={() => setSettingsOpen(true)} accessibilityRole="button" accessibilityLabel={t('settings')}>
          <Feather name="settings" size={19} color={colors.mutedForeground} />
        </TouchableOpacity>
      </View>
      <View style={s.converter}>
        <Text style={s.fieldLabel}>{t('from')}</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} value={amountText} onChangeText={setAmountText} keyboardType="decimal-pad" placeholder="0" placeholderTextColor={colors.border} maxLength={12} accessibilityLabel={t('amount')} />
          <TouchableOpacity style={s.currencyButton} onPress={() => setPicker('from')}><Text style={s.currencyCode}>{from}</Text><Ionicons name="chevron-down" size={14} color={colors.primary} /></TouchableOpacity>
        </View>
        <View style={s.divider} />
        <TouchableOpacity style={s.swapButton} onPress={swap} accessibilityRole="button" accessibilityLabel={t('swapCurrencies')}><Ionicons name="swap-vertical" size={21} color="#FFF" /></TouchableOpacity>
        <Text style={s.fieldLabel}>{t('to')}</Text>
        <View style={s.inputRow}>
          <Text style={s.result} numberOfLines={1} adjustsFontSizeToFit>{SYMBOLS[to]}{formatAmount(result)}</Text>
          <TouchableOpacity style={s.currencyButton} onPress={() => setPicker('to')}><Text style={s.currencyCode}>{to}</Text><Ionicons name="chevron-down" size={14} color={colors.primary} /></TouchableOpacity>
        </View>
        <View style={s.meta}><Text style={s.rate}>1 {from} = {rate.toFixed(4)} {to}</Text><Text style={s.updated}>{t('updatedNow')}</Text></View>
      </View>

      <View style={s.sectionHeader}><Text style={s.sectionTitle}>{t('favoritePairs')}</Text><Text style={s.sectionHint}>{t('tapToUse')}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {(favoritePairs.length ? favoritePairs : [{ from: 'USD' as CurrencyCode, to: 'EUR' as CurrencyCode }]).slice(0, 4).map(pair =>
          <TouchableOpacity key={`${pair.from}-${pair.to}`} style={s.pair} onPress={() => applyPair(pair.from, pair.to)}>
            <Text style={s.pairTitle}>{pair.from} → {pair.to}</Text><Text style={s.pairRate}>1 {pair.from} = {convert(1, pair.from, pair.to).toFixed(3)} {pair.to}</Text>
          </TouchableOpacity>)}
      </ScrollView>

      <View style={s.sectionHeader}><Text style={s.sectionTitle}>{t('recentConversions')}</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.horizontal}>
        {shownPairs.length ? shownPairs.map(pair => <TouchableOpacity key={`recent-${pair.from}-${pair.to}`} style={s.pair} onPress={() => applyPair(pair.from, pair.to)}><Text style={s.pairTitle}>{pair.from} → {pair.to}</Text><Text style={s.pairRate}>{t('repeatConversion')}</Text></TouchableOpacity>) : <Text style={s.sectionHint}>{t('noRecentConversions')}</Text>}
      </ScrollView>

      <View style={s.sectionHeader}><Text style={s.sectionTitle}>{t('popularCurrencies')}</Text></View>
      <View style={s.popularRow}>{POPULAR.map(code => <TouchableOpacity key={code} style={s.popular} onPress={() => { const nextFrom = code === to ? from : to; setFrom(nextFrom); setTo(code); remember(nextFrom, code); }}><Text style={{ color: colors.mutedForeground }}>{SYMBOLS[code]}</Text><Text style={s.popularCode}>{code}</Text></TouchableOpacity>)}</View>

      <View style={s.secondary}>
        <TouchableOpacity style={s.secondaryButton} onPress={() => router.navigate('/wallet')}><Feather name="credit-card" size={15} color={colors.mutedForeground} /><Text style={s.secondaryText}>{t('wallet')}</Text></TouchableOpacity>
        <TouchableOpacity style={s.secondaryButton} onPress={() => router.navigate('/ai')}><Ionicons name="sparkles-outline" size={16} color={colors.mutedForeground} /><Text style={s.secondaryText}>{t('ai')}</Text></TouchableOpacity>
      </View>
    </ScrollView>

    <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}><TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setPicker(null)}><TouchableOpacity activeOpacity={1}><View style={s.sheet}><View style={s.handle} /><Text style={s.sheetTitle}>{t('selectCurrency')}</Text>{CODES.map(code => <TouchableOpacity key={code} style={s.pickerRow} onPress={() => selectCurrency(code)}><Text style={s.pickerSymbol}>{SYMBOLS[code]}</Text><Text style={s.pickerName}>{currencies[code][language === 'ru' ? 'nameRu' : language === 'he' ? 'nameHe' : 'nameEn']}</Text><Text style={s.currencyCode}>{code}</Text></TouchableOpacity>)}</View></TouchableOpacity></TouchableOpacity></Modal>
    <Modal visible={settingsOpen} transparent animationType="slide" onRequestClose={() => setSettingsOpen(false)}><TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => setSettingsOpen(false)}><TouchableOpacity activeOpacity={1}><View style={s.sheet}><View style={s.handle} /><TouchableOpacity style={s.done} onPress={() => setSettingsOpen(false)}><Text style={s.doneText}>{t('done')}</Text></TouchableOpacity><Text style={s.sheetTitle}>{t('language')}</Text>{LANGS.map(item => <TouchableOpacity key={item.code} style={s.pickerRow} onPress={() => setLanguage(item.code)}><Text style={s.pickerName}>{item.label}</Text>{language === item.code && <Ionicons name="checkmark" size={20} color={colors.primary} />}</TouchableOpacity>)}</View></TouchableOpacity></TouchableOpacity></Modal>
  </View>;
}
