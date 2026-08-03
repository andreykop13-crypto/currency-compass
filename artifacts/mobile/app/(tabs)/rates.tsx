import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CURRENCY_MAP } from '@/data/currencies';
import { useAppContext } from '@/context/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

export default function RatesScreen() {
  const colors = useThemeColors(); const insets = useSafeAreaInsets(); const t = useTranslation();
  const { targetCurrencies, getCurrencyName, language } = useAppContext(); const rtl = language === 'he';
  const s = StyleSheet.create({ page: { flex: 1, backgroundColor: colors.background }, content: { padding: 16, paddingTop: insets.top + 12, paddingBottom: 110 },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
    subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.mutedForeground, marginTop: 4, marginBottom: 16, textAlign: rtl ? 'right' : 'left' },
    card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
    row: { minHeight: 64, paddingHorizontal: 14, flexDirection: rtl ? 'row-reverse' : 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: colors.border, gap: 10 },
    flag: { fontSize: 22 }, meta: { flex: 1 }, code: { fontFamily: 'Inter_700Bold', fontSize: 15, color: colors.foreground, textAlign: rtl ? 'right' : 'left' },
    name: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.mutedForeground, textAlign: rtl ? 'right' : 'left' },
    rate: { fontFamily: 'Inter_600SemiBold', fontSize: 15, color: colors.foreground } });
  return <View style={s.page}><ScrollView contentContainerStyle={s.content}><Text style={s.title}>{t('ratesTab')}</Text>
    <Text style={s.subtitle}>{t('referenceRatesStatus')}</Text><View style={s.card}>{targetCurrencies.map((code) => <View style={s.row} key={code}>
      <Text style={s.flag}>{CURRENCY_MAP[code].flag}</Text><View style={s.meta}><Text style={s.code}>{code}</Text><Text style={s.name}>{getCurrencyName(code)}</Text></View>
      <Text style={s.rate}>{CURRENCY_MAP[code].rateToUSD.toLocaleString()}</Text></View>)}</View></ScrollView></View>;
}
