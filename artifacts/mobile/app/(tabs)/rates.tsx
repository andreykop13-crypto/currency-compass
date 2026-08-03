import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CURRENCY_MAP } from '@/data/currencies';
import CurrencyFlag from '@/components/CurrencyFlag';
import { useAppContext } from '@/context/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

export default function RatesScreen() {
  const colors = useThemeColors(); const insets = useSafeAreaInsets(); const t = useTranslation();
  const { activeCurrency, targetCurrencies, convert, getCurrencyName, language } = useAppContext(); const rtl = language === 'he';
  const s = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, marginTop: 3, marginBottom: 14, textAlign: rtl ? 'right' : 'left' },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row: { height: 64, paddingHorizontal: 12, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border, gap: 10 },
    flagBox: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.muted, borderWidth: 1, borderColor: colors.border },
    meta: { flex: 1, minWidth: 0 }, code: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
    name: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
    rate: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.foreground } });
  return <View style={s.page}><ScrollView contentContainerStyle={s.content}><Text style={s.title}>{t('ratesTab')}</Text>
    <Text style={s.subtitle}>{t('referenceRatesStatus')}</Text><View style={s.card}>{targetCurrencies.map((code) => <View style={s.row} key={code}>
      <View style={s.flagBox}><CurrencyFlag flag={CURRENCY_MAP[code].flag} size={22} /></View><View style={s.meta}><Text style={s.code}>{code}</Text><Text style={s.name} numberOfLines={1}>{getCurrencyName(code)}</Text></View>
      <Text style={s.rate}>1 {activeCurrency} = {convert(1, activeCurrency, code).toLocaleString(undefined, { maximumFractionDigits: 4 })}</Text></View>)}</View></ScrollView></View>;
}
