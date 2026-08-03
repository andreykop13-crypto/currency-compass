import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Language, useAppContext } from '@/context/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

const languages: { code: Language; label: string }[] = [{ code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }, { code: 'he', label: 'עברית' }];
export default function SettingsScreen() {
  const colors = useThemeColors(); const insets = useSafeAreaInsets(); const t = useTranslation(); const { language, setLanguage } = useAppContext();
  const s = StyleSheet.create({ page: { flex: 1, padding: 16, paddingTop: insets.top + 12, backgroundColor: colors.background },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: colors.foreground, textAlign: language === 'he' ? 'right' : 'left' },
    section: { fontFamily: 'Inter_600SemiBold', fontSize: 11, letterSpacing: .8, textTransform: 'uppercase', color: colors.mutedForeground, marginTop: 22, marginBottom: 8, paddingHorizontal: 2, textAlign: language === 'he' ? 'right' : 'left' },
    card: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    row: { minHeight: 56, paddingHorizontal: 16, flexDirection: language === 'he' ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
    lastRow: { borderBottomWidth: 0 }, text: { fontFamily: 'Inter_500Medium', color: colors.foreground, fontSize: 15 }, selected: { color: colors.primary, fontFamily: 'Inter_600SemiBold' } });
  return <View style={s.page}><Text style={s.title}>{t('settings')}</Text><Text style={s.section}>{t('language')}</Text><View style={s.card}>
    {languages.map((item, index) => <TouchableOpacity key={item.code} style={[s.row, index === languages.length - 1 && s.lastRow]} onPress={() => setLanguage(item.code)} accessibilityRole="radio" accessibilityState={{ checked: language === item.code }}>
      <Text style={[s.text, language === item.code && s.selected]}>{item.label}</Text>
      {language === item.code && <Ionicons name="checkmark-circle" size={21} color={colors.primary} />}</TouchableOpacity>)}</View></View>;
}
