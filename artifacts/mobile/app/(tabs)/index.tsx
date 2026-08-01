import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Modal, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext, CurrencyCode, Language } from '@/context/AppContext';

const CURRENCY_PAIRS: Array<{ from: CurrencyCode; to: CurrencyCode }> = [
  { from: 'USD', to: 'ILS' },
  { from: 'USD', to: 'EUR' },
  { from: 'EUR', to: 'ILS' },
  { from: 'USD', to: 'RUB' },
];

function getGreeting(t: ReturnType<typeof useTranslation>): string {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return t('goodMorning');
  if (h >= 12 && h < 18) return t('goodDay');
  return t('goodEvening');
}

function formatDate(language: Language): string {
  const now = new Date();
  const locale = language === 'en' ? 'en-US' : language === 'he' ? 'he-IL' : 'ru-RU';
  return now.toLocaleDateString(locale, { day: 'numeric', month: 'long' });
}

const LANGS: Array<{ code: Language; label: string; native: string }> = [
  { code: 'ru', label: 'Русский', native: 'RU' },
  { code: 'en', label: 'English', native: 'EN' },
  { code: 'he', label: 'עברית', native: 'HE' },
];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useTranslation();
  const { currencies, convert, language, setLanguage, favoritePairs } = useAppContext();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const btmPad = isWeb ? 34 : 90;

  const handleNav = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.navigate(route as any);
  };

  const marketRates = [
    { label: 'ILS', value: `1 USD = ${convert(1, 'USD', 'ILS').toFixed(2)} ₪`, change: currencies.ILS.change24h },
    { label: 'EUR', value: `1 USD = ${convert(1, 'USD', 'EUR').toFixed(3)} €`, change: currencies.EUR.change24h },
    { label: 'RUB', value: `1 USD = ${convert(1, 'USD', 'RUB').toFixed(1)} ₽`, change: currencies.RUB.change24h },
    { label: 'BYN', value: `1 USD = ${convert(1, 'USD', 'BYN').toFixed(2)} Br`, change: currencies.BYN.change24h },
  ];

  const displayPairs = favoritePairs.length > 0
    ? favoritePairs.slice(0, 4)
    : CURRENCY_PAIRS;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: btmPad },
    header: {
      paddingHorizontal: 20,
      paddingTop: topPad + 8,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    greeting: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    date: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 2,
    },
    settingsBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
    },
    sectionPad: { paddingHorizontal: 20 },
    sectionLabel: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginTop: 20,
    },
    // Market card
    marketCard: {
      marginHorizontal: 20,
      borderRadius: colors.radius,
      overflow: 'hidden',
    },
    marketGrad: {
      padding: 20,
    },
    marketTitle: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      color: 'rgba(255,255,255,0.7)',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 16,
    },
    rateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    rateValue: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: '#FFFFFF',
    },
    rateChange: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(255,255,255,0.15)',
      marginVertical: 12,
    },
    marketFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    marketFooterText: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: 'rgba(255,255,255,0.55)',
    },
    // Favorite pairs
    pairsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      paddingHorizontal: 20,
    },
    pairCard: {
      flex: 1,
      minWidth: '44%',
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pairLabel: {
      fontSize: 13,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      marginBottom: 4,
    },
    pairRate: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    pairArrow: {
      fontSize: 11,
      color: colors.mutedForeground,
      marginBottom: 2,
    },
    // Quick actions
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: 20,
      marginBottom: 24,
    },
    actionBtn: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      paddingVertical: 16,
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    actionIconBg: {
      width: 40,
      height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionLabel: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.foreground,
    },
    // Disclaimer
    disclaimer: {
      marginHorizontal: 20,
      marginBottom: 12,
      padding: 12,
      backgroundColor: colors.muted,
      borderRadius: 10,
      flexDirection: 'row',
      gap: 8,
      alignItems: 'flex-start',
    },
    disclaimerText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      lineHeight: 18,
    },
    // Settings modal
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    modalSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: isWeb ? 34 : insets.bottom + 20,
    },
    modalHandle: {
      width: 36,
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    modalDone: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: colors.primary,
    },
    sectionLabelModal: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      paddingHorizontal: 20,
      marginBottom: 8,
    },
    langRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    langLabel: {
      fontSize: 16,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
    },
  });

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{getGreeting(t)}</Text>
            <Text style={s.date}>{formatDate(language)}</Text>
          </View>
          <TouchableOpacity
            style={s.settingsBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSettingsOpen(true); }}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        {/* Market overview card */}
        <View style={s.marketCard}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.marketGrad}
          >
            <Text style={s.marketTitle}>{t('marketOverview')}</Text>
            {marketRates.map((r, i) => (
              <React.Fragment key={r.label}>
                <View style={s.rateRow}>
                  <Text style={s.rateValue}>{r.value}</Text>
                  <Text style={[s.rateChange, { color: r.change >= 0 ? '#5DFFCD' : '#FF8585' }]}>
                    {r.change >= 0 ? '+' : ''}{r.change.toFixed(2)}%
                  </Text>
                </View>
                {i < marketRates.length - 1 && <View style={s.divider} />}
              </React.Fragment>
            ))}
            <View style={[s.divider, { marginBottom: 8 }]} />
            <View style={s.marketFooter}>
              <Feather name="info" size={12} color="rgba(255,255,255,0.5)" />
              <Text style={s.marketFooterText}>{t('testData')} — {formatDate(language)}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Favorite pairs */}
        <Text style={[s.sectionLabel, s.sectionPad]}>{t('quickActions')}</Text>
        <View style={s.pairsRow}>
          {displayPairs.map(pair => {
            const rate = convert(1, pair.from, pair.to);
            const sym = { USD: '$', EUR: '€', ILS: '₪', RUB: '₽', BYN: 'Br' };
            return (
              <TouchableOpacity
                key={`${pair.from}-${pair.to}`}
                style={s.pairCard}
                onPress={() => handleNav('/convert')}
                activeOpacity={0.7}
              >
                <Text style={s.pairArrow}>{pair.from} → {pair.to}</Text>
                <Text style={s.pairLabel}>{sym[pair.from]}1 = {sym[pair.to]}{rate.toFixed(pair.to === 'RUB' ? 1 : 2)}</Text>
                <Text style={[s.pairRate, { color: currencies[pair.to].change24h >= 0 ? colors.positive : colors.negative }]}>
                  {currencies[pair.to].change24h >= 0 ? '+' : ''}{currencies[pair.to].change24h.toFixed(2)}%
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Quick actions */}
        <Text style={[s.sectionLabel, s.sectionPad, { marginTop: 20 }]}></Text>
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.actionBtn} onPress={() => handleNav('/convert')} activeOpacity={0.7}>
            <View style={[s.actionIconBg, { backgroundColor: colors.secondary }]}>
              <Ionicons name="swap-horizontal" size={20} color={colors.primary} />
            </View>
            <Text style={s.actionLabel}>{t('goToConverter')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => handleNav('/ai')} activeOpacity={0.7}>
            <View style={[s.actionIconBg, { backgroundColor: '#F0F7FF' }]}>
              <Ionicons name="sparkles" size={20} color="#5B9BFF" />
            </View>
            <Text style={s.actionLabel}>{t('askAI')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={() => handleNav('/wallet')} activeOpacity={0.7}>
            <View style={[s.actionIconBg, { backgroundColor: colors.accent + '20' }]}>
              <Feather name="credit-card" size={20} color={colors.accent} />
            </View>
            <Text style={s.actionLabel}>{t('addFunds')}</Text>
          </TouchableOpacity>
        </View>

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Feather name="alert-circle" size={14} color={colors.mutedForeground} style={{ marginTop: 1 }} />
          <Text style={s.disclaimerText}>{t('rateDisclaimer')}</Text>
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        visible={settingsOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsOpen(false)}
      >
        <TouchableOpacity
          style={s.modalOverlay}
          activeOpacity={1}
          onPress={() => setSettingsOpen(false)}
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View style={s.modalSheet}>
              <View style={s.modalHandle} />
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>{t('settings')}</Text>
                <TouchableOpacity onPress={() => setSettingsOpen(false)}>
                  <Text style={s.modalDone}>{t('done')}</Text>
                </TouchableOpacity>
              </View>
              <Text style={s.sectionLabelModal}>{t('language')}</Text>
              {LANGS.map(l => (
                <TouchableOpacity
                  key={l.code}
                  style={s.langRow}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setLanguage(l.code);
                  }}
                >
                  <Text style={s.langLabel}>{l.label}</Text>
                  {language === l.code && (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
