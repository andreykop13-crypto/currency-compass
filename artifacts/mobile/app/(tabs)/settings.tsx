import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Language, useAppContext } from '@/context/AppContext';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';

const languages: { code: Language; label: string }[] = [{ code: 'ru', label: 'Русский' }, { code: 'en', label: 'English' }, { code: 'he', label: 'עברית' }];
export default function SettingsScreen() {
  const colors = useThemeColors(); const insets = useSafeAreaInsets(); const t = useTranslation(); const { language, setLanguage } = useAppContext();
  const s = StyleSheet.create({ page: { flex: 1, padding: 16, paddingTop: insets.top + 12, backgroundColor: colors.background },
    title: { fontFamily: 'Inter_700Bold', fontSize: 28, color: colors.foreground, textAlign: language === 'he' ? 'right' : 'left' },
    section: { fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.mutedForeground, marginTop: 24, marginBottom: 8, textAlign: language === 'he' ? 'right' : 'left' },
    card: { borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card },
    row: { minHeight: 56, paddingHorizontal: 16, justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.border },
    text: { fontFamily: 'Inter_500Medium', color: colors.foreground, fontSize: 16 }, selected: { color: colors.primary, fontFamily: 'Inter_700Bold' } });
  return <View style={s.page}><Text style={s.title}>{t('settings')}</Text><Text style={s.section}>{t('language')}</Text><View style={s.card}>
    {languages.map((item) => <TouchableOpacity key={item.code} style={s.row} onPress={() => setLanguage(item.code)} accessibilityRole="radio" accessibilityState={{ checked: language === item.code }}>
      <Text style={[s.text, language === item.code && s.selected]}>{item.label}{language === item.code ? '  ✓' : ''}</Text></TouchableOpacity>)}</View></View>;
}
