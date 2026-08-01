import React, { useState, useMemo, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, SectionList, Platform, SectionListData,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useAppContext } from '@/context/AppContext';
import { CurrencyInfo, ALL_CURRENCIES, POPULAR_CODES } from '@/data/currencies';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (code: string) => void;
  currentCode: string;
  title?: string;
  excludeCode?: string; // optionally grey out (but don't hide)
}

interface Section {
  key: string;
  title: string;
  data: CurrencyInfo[];
}

const BADGE_COLORS: Record<string, string> = {
  USD: '#1A6BDE', EUR: '#003399', GBP: '#012169', JPY: '#BC002D',
  CNY: '#DE2910', AUD: '#00008B', CAD: '#D80621', CHF: '#FF0000',
  ILS: '#003366', RUB: '#003DA5', BYN: '#CF101A', TRY: '#E30A17',
  AED: '#009A44', SAR: '#006C35', INR: '#FF9933', KRW: '#003478',
  MXN: '#006847', BRL: '#009C3B', SGD: '#EF3340', HKD: '#DE2910',
  NOK: '#EF2B2D', SEK: '#006AA7', DKK: '#C60C30', NZD: '#00247D',
  THB: '#A51931', MYR: '#CC0001', IDR: '#CE1126', PHP: '#0038A8',
  ZAR: '#007A4D', EGP: '#CE1126', NGN: '#008751', KES: '#006600',
  XAU: '#FFD700', XAG: '#C0C0C0', XDR: '#0066CC',
};

function getBadgeColor(code: string): string {
  return BADGE_COLORS[code] ?? '#5B6B7A';
}

export default function CurrencyPicker({
  visible, onClose, onSelect, currentCode, title, excludeCode,
}: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { recentCurrencies, language } = useAppContext();
  const isWeb = Platform.OS === 'web';

  const [query, setQuery] = useState('');

  const getName = useCallback((c: CurrencyInfo): string => {
    if (language === 'ru' && c.nameRu) return c.nameRu;
    if (language === 'he' && c.nameHe) return c.nameHe;
    return c.nameEn;
  }, [language]);

  // ── Sections (no search) ──────────────────────────────────────────────────
  const sections: Section[] = useMemo(() => {
    const popular = POPULAR_CODES
      .map(code => ALL_CURRENCIES.find(c => c.code === code))
      .filter(Boolean) as CurrencyInfo[];

    const recentSet = new Set(recentCurrencies);
    const recent = recentCurrencies
      .map(code => ALL_CURRENCIES.find(c => c.code === code))
      .filter(Boolean) as CurrencyInfo[];

    const secs: Section[] = [];

    if (recent.length > 0) {
      const recentLabel = language === 'ru' ? 'Недавние' : language === 'he' ? 'אחרונים' : 'Recent';
      secs.push({ key: 'recent', title: recentLabel, data: recent });
    }

    const popularLabel = language === 'ru' ? 'Популярные' : language === 'he' ? 'פופולריים' : 'Popular';
    secs.push({ key: 'popular', title: popularLabel, data: popular });

    const allLabel = language === 'ru' ? 'Все валюты' : language === 'he' ? 'כל המטבעות' : 'All currencies';
    secs.push({ key: 'all', title: allLabel, data: ALL_CURRENCIES });

    return secs;
  }, [recentCurrencies, language]);

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults: CurrencyInfo[] = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.trim().toLowerCase();
    return ALL_CURRENCIES.filter(c =>
      c.code.toLowerCase().includes(q) ||
      c.nameEn.toLowerCase().includes(q) ||
      (c.nameRu && c.nameRu.toLowerCase().includes(q)) ||
      c.symbol.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (code: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSelect(code);
    setQuery('');
    onClose();
  };

  const s = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '88%',
      paddingBottom: isWeb ? 24 : insets.bottom + 16,
    },
    handle: {
      width: 36, height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginTop: 12,
      marginBottom: 14,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    title: {
      flex: 1,
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    closeBtn: {
      width: 32, height: 32,
      borderRadius: 16,
      backgroundColor: colors.muted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginBottom: 8,
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 9,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      padding: 0,
    },
    clearBtn: { padding: 2 },
    sectionHeader: {
      paddingHorizontal: 20,
      paddingTop: 14,
      paddingBottom: 6,
      backgroundColor: colors.background,
    },
    sectionTitle: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      letterSpacing: 0.9,
      textTransform: 'uppercase',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 11,
      gap: 12,
    },
    rowActive: { backgroundColor: colors.secondary },
    badge: {
      width: 40, height: 40,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      fontSize: 11,
      fontFamily: 'Inter_700Bold',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    symbol: {
      fontSize: 15,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      width: 22,
      textAlign: 'center',
    },
    info: { flex: 1 },
    code: {
      fontSize: 15,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    name: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 1,
    },
    rate: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      textAlign: 'right',
    },
    emptyWrap: {
      paddingVertical: 48,
      alignItems: 'center',
      gap: 8,
    },
    emptyText: {
      fontSize: 15,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    emptySubtext: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
  });

  const renderRow = ({ item }: { item: CurrencyInfo }) => {
    const isActive = item.code === currentCode;
    const isExcluded = item.code === excludeCode;
    return (
      <TouchableOpacity
        style={[s.row, isActive && s.rowActive]}
        onPress={() => handleSelect(item.code)}
        activeOpacity={0.65}
      >
        <View style={[s.badge, { backgroundColor: getBadgeColor(item.code) }]}>
          <Text style={s.badgeText} numberOfLines={1}>{item.code.slice(0, 3)}</Text>
        </View>
        <Text style={[s.symbol, isExcluded && { opacity: 0.4 }]}>{item.symbol}</Text>
        <View style={s.info}>
          <Text style={[s.code, isExcluded && { opacity: 0.4 }]}>{item.code}</Text>
          <Text style={s.name} numberOfLines={1}>{getName(item)}</Text>
        </View>
        {isActive
          ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
          : <Text style={s.rate}>{item.rateToUSD < 0.01
              ? item.rateToUSD.toFixed(6)
              : item.rateToUSD < 1
                ? item.rateToUSD.toFixed(4)
                : item.rateToUSD >= 10000
                  ? item.rateToUSD.toFixed(0)
                  : item.rateToUSD.toFixed(2)
            }</Text>
        }
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: SectionListData<CurrencyInfo, Section> }) => (
    <View style={s.sectionHeader}>
      <Text style={s.sectionTitle}>{section.title}</Text>
    </View>
  );

  const pickerTitle = title ?? (language === 'ru' ? 'Выберите валюту' : language === 'he' ? 'בחר מטבע' : 'Select currency');

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={() => { setQuery(''); onClose(); }}
    >
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={() => { setQuery(''); onClose(); }}>
        <TouchableOpacity activeOpacity={1}>
          <View style={s.sheet}>
            <View style={s.handle} />
            <View style={s.headerRow}>
              <Text style={s.title}>{pickerTitle}</Text>
              <TouchableOpacity style={s.closeBtn} onPress={() => { setQuery(''); onClose(); }}>
                <Ionicons name="close" size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>

            {/* Search */}
            <View style={s.searchWrap}>
              <Ionicons name="search" size={16} color={colors.mutedForeground} />
              <TextInput
                style={s.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={language === 'ru' ? 'Поиск по коду или названию...' : language === 'he' ? 'חפש לפי קוד או שם...' : 'Search by code or name...'}
                placeholderTextColor={colors.mutedForeground}
                autoCorrect={false}
                autoCapitalize="characters"
                selectionColor={colors.primary}
                returnKeyType="search"
              />
              {query.length > 0 && (
                <TouchableOpacity style={s.clearBtn} onPress={() => setQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.mutedForeground} />
                </TouchableOpacity>
              )}
            </View>

            {/* Content */}
            {query.trim() ? (
              searchResults.length === 0 ? (
                <View style={s.emptyWrap}>
                  <Text style={s.emptyText}>{language === 'ru' ? 'Ничего не найдено' : language === 'he' ? 'לא נמצא' : 'Nothing found'}</Text>
                  <Text style={s.emptySubtext}>«{query}»</Text>
                </View>
              ) : (
                <SectionList
                  sections={[{ key: 'results', title: '', data: searchResults }]}
                  keyExtractor={item => `search-${item.code}`}
                  renderItem={renderRow}
                  renderSectionHeader={() => null}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  stickySectionHeadersEnabled={false}
                />
              )
            ) : (
              <SectionList
                sections={sections}
                keyExtractor={(item, idx) => `${item.code}-${idx}`}
                renderItem={renderRow}
                renderSectionHeader={renderSectionHeader}
                stickySectionHeadersEnabled
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              />
            )}
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}
