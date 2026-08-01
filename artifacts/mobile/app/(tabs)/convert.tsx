import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Modal, FlatList, Platform, ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle, withTiming, withSequence,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext, CurrencyCode, CURRENCIES } from '@/context/AppContext';

const CURRENCY_CODES: CurrencyCode[] = ['USD', 'EUR', 'ILS', 'RUB', 'BYN'];
const SYM: Record<CurrencyCode, string> = { USD: '$', EUR: '€', ILS: '₪', RUB: '₽', BYN: 'Br' };

export default function ConvertScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useTranslation();
  const { convert, isFavoritePair, toggleFavoritePair, currencies, formatAmount } = useAppContext();

  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>('USD');
  const [toCurrency, setToCurrency] = useState<CurrencyCode>('ILS');
  const [amountText, setAmountText] = useState('100');
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [useCustomRate, setUseCustomRate] = useState(false);
  const [customRateText, setCustomRateText] = useState('');

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const btmPad = isWeb ? 34 : 90;

  const swapRotation = useSharedValue(0);
  const swapStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${swapRotation.value}deg` }],
  }));

  const amount = parseFloat(amountText.replace(/[^0-9.]/g, '')) || 0;
  const marketRate = convert(1, fromCurrency, toCurrency);
  const effectiveRate = (useCustomRate && customRateText && parseFloat(customRateText) > 0)
    ? parseFloat(customRateText)
    : marketRate;
  const result = amount * effectiveRate;

  const isFav = isFavoritePair(fromCurrency, toCurrency);

  const handleSwap = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    swapRotation.value = withSequence(
      withTiming(swapRotation.value + 180, { duration: 300 }),
    );
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    const newAmount = result.toFixed(2);
    setAmountText(newAmount);
  };

  const handleToggleFav = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleFavoritePair(fromCurrency, toCurrency);
  };

  const rateDisplay = `1 ${fromCurrency} = ${effectiveRate.toFixed(4)} ${toCurrency}`;
  const inverseRate = `1 ${toCurrency} = ${(1 / effectiveRate).toFixed(4)} ${fromCurrency}`;

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1 },
    scrollContent: { paddingBottom: btmPad },
    header: {
      paddingHorizontal: 20,
      paddingTop: topPad + 8,
      paddingBottom: 8,
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    // Currency card
    currencyCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currencySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    currencyBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.secondary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 6,
      gap: 4,
    },
    currencyCode: {
      fontSize: 14,
      fontFamily: 'Inter_700Bold',
      color: colors.primary,
    },
    currencyName: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      flex: 1,
    },
    amountInput: {
      fontSize: 44,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      letterSpacing: -1.5,
      padding: 0,
      minHeight: 56,
    },
    resultText: {
      fontSize: 44,
      fontFamily: 'Inter_700Bold',
      color: colors.accent,
      letterSpacing: -1.5,
      minHeight: 56,
    },
    currencySymbol: {
      fontSize: 22,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      marginTop: 8,
    },
    amountRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 6,
    },
    // Swap area
    swapArea: {
      alignItems: 'center',
      marginVertical: 12,
    },
    swapBtn: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.18,
      shadowRadius: 8,
      elevation: 4,
    },
    // Rate info
    rateCard: {
      marginHorizontal: 20,
      marginTop: 16,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 10,
    },
    rateRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    rateLabel: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    rateValue: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    divider: { height: 1, backgroundColor: colors.border },
    // Favorite & custom
    actionsRow: {
      flexDirection: 'row',
      gap: 10,
      marginHorizontal: 20,
      marginTop: 16,
    },
    favBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: isFav ? colors.goldBg : colors.card,
      borderRadius: colors.radius,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: isFav ? colors.gold : colors.border,
    },
    favBtnText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: isFav ? colors.gold : colors.mutedForeground,
    },
    customRateToggle: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: useCustomRate ? colors.secondary : colors.card,
      borderRadius: colors.radius,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: useCustomRate ? colors.primary : colors.border,
    },
    customRateText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: useCustomRate ? colors.primary : colors.mutedForeground,
    },
    // Custom rate input
    customRateCard: {
      marginHorizontal: 20,
      marginTop: 12,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    customRateLabel: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    customRateInput: {
      flex: 1,
      fontSize: 20,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      padding: 0,
    },
    clearCustom: {
      padding: 4,
    },
    // Disclaimer
    disclaimer: {
      marginHorizontal: 20,
      marginTop: 16,
      marginBottom: 8,
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
    // Picker modal
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    pickerSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: isWeb ? 34 : insets.bottom + 20,
      maxHeight: 420,
    },
    pickerHandle: {
      width: 36, height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 12,
    },
    pickerTitle: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      paddingHorizontal: 20,
      paddingBottom: 12,
    },
    pickerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      gap: 12,
    },
    pickerCode: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      width: 42,
    },
    pickerSymbol: {
      fontSize: 18,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      width: 24,
    },
    pickerName: {
      flex: 1,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
    },
    pickerRate: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
  });

  const CurrencyPickerModal = ({ visible, onClose, onSelect, current }: {
    visible: boolean; onClose: () => void;
    onSelect: (code: CurrencyCode) => void; current: CurrencyCode;
  }) => (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1}>
          <View style={s.pickerSheet}>
            <View style={s.pickerHandle} />
            <Text style={s.pickerTitle}>{t('selectCurrency')}</Text>
            <FlatList
              data={CURRENCY_CODES}
              keyExtractor={item => item}
              renderItem={({ item }) => {
                const c = currencies[item];
                const rateVsUSD = item === 'USD' ? 1 : CURRENCIES[item].rateToUSD;
                return (
                  <TouchableOpacity
                    style={[s.pickerRow, item === current && { backgroundColor: colors.secondary }]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onSelect(item); onClose(); }}
                  >
                    <Text style={s.pickerCode}>{item}</Text>
                    <Text style={s.pickerSymbol}>{SYM[item]}</Text>
                    <Text style={s.pickerName}>{c.nameRu}</Text>
                    {item === current && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={s.container}>
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('convert')}</Text>
        </View>

        {/* From card */}
        <View style={s.currencyCard}>
          <View style={s.currencySelector}>
            <TouchableOpacity
              style={s.currencyBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowFromPicker(true); }}
            >
              <Text style={s.currencyCode}>{fromCurrency}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
            <Text style={s.currencyName}>{currencies[fromCurrency].nameRu}</Text>
          </View>
          <View style={s.amountRow}>
            <Text style={s.currencySymbol}>{SYM[fromCurrency]}</Text>
            <TextInput
              style={s.amountInput}
              value={amountText}
              onChangeText={setAmountText}
              keyboardType="decimal-pad"
              placeholder="0"
              placeholderTextColor={colors.border}
              selectionColor={colors.primary}
            />
          </View>
        </View>

        {/* Swap button */}
        <View style={s.swapArea}>
          <TouchableOpacity style={s.swapBtn} onPress={handleSwap} activeOpacity={0.8}>
            <Animated.View style={swapStyle}>
              <Ionicons name="swap-vertical" size={22} color="#FFFFFF" />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* To card */}
        <View style={s.currencyCard}>
          <View style={s.currencySelector}>
            <TouchableOpacity
              style={s.currencyBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowToPicker(true); }}
            >
              <Text style={s.currencyCode}>{toCurrency}</Text>
              <Ionicons name="chevron-down" size={14} color={colors.primary} />
            </TouchableOpacity>
            <Text style={s.currencyName}>{currencies[toCurrency].nameRu}</Text>
          </View>
          <View style={s.amountRow}>
            <Text style={s.currencySymbol}>{SYM[toCurrency]}</Text>
            <Text style={s.resultText}>{formatAmount(result)}</Text>
          </View>
        </View>

        {/* Rate info */}
        <View style={s.rateCard}>
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>{t('exchangeRate')}</Text>
            <Text style={s.rateValue}>{rateDisplay}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.rateRow}>
            <Text style={s.rateLabel}></Text>
            <Text style={[s.rateLabel, { color: colors.mutedForeground }]}>{inverseRate}</Text>
          </View>
          <View style={s.divider} />
          <View style={s.rateRow}>
            <Text style={s.rateLabel}>{t('source')}</Text>
            <Text style={s.rateValue}>{t('testData')}</Text>
          </View>
          {useCustomRate && customRateText && parseFloat(customRateText) > 0 && (
            <>
              <View style={s.divider} />
              <View style={s.rateRow}>
                <Text style={s.rateLabel}>{t('customRate')}</Text>
                <Text style={[s.rateValue, { color: colors.gold }]}>{customRateText}</Text>
              </View>
            </>
          )}
        </View>

        {/* Actions */}
        <View style={s.actionsRow}>
          <TouchableOpacity style={s.favBtn} onPress={handleToggleFav} activeOpacity={0.7}>
            <Ionicons name={isFav ? 'star' : 'star-outline'} size={16} color={isFav ? colors.gold : colors.mutedForeground} />
            <Text style={s.favBtnText}>{isFav ? t('removeFromFavorites') : t('addToFavorites')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={s.customRateToggle}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUseCustomRate(!useCustomRate); }}
            activeOpacity={0.7}
          >
            <Feather name="edit-2" size={14} color={useCustomRate ? colors.primary : colors.mutedForeground} />
            <Text style={s.customRateText}>{t('customRate')}</Text>
          </TouchableOpacity>
        </View>

        {/* Custom rate input */}
        {useCustomRate && (
          <View style={s.customRateCard}>
            <Text style={s.customRateLabel}>1 {fromCurrency} =</Text>
            <TextInput
              style={s.customRateInput}
              value={customRateText}
              onChangeText={setCustomRateText}
              keyboardType="decimal-pad"
              placeholder={effectiveRate.toFixed(4)}
              placeholderTextColor={colors.border}
              selectionColor={colors.primary}
              autoFocus
            />
            <Text style={s.customRateLabel}>{toCurrency}</Text>
            {customRateText.length > 0 && (
              <TouchableOpacity style={s.clearCustom} onPress={() => setCustomRateText('')}>
                <Ionicons name="close-circle" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Disclaimer */}
        <View style={s.disclaimer}>
          <Feather name="alert-circle" size={14} color={colors.mutedForeground} style={{ marginTop: 1 }} />
          <Text style={s.disclaimerText}>{t('rateDisclaimer')}</Text>
        </View>
      </ScrollView>

      <CurrencyPickerModal
        visible={showFromPicker}
        onClose={() => setShowFromPicker(false)}
        onSelect={code => { if (code !== toCurrency) setFromCurrency(code); else { setFromCurrency(code); setToCurrency(fromCurrency); } }}
        current={fromCurrency}
      />
      <CurrencyPickerModal
        visible={showToPicker}
        onClose={() => setShowToPicker(false)}
        onSelect={code => { if (code !== fromCurrency) setToCurrency(code); else { setToCurrency(code); setFromCurrency(toCurrency); } }}
        current={toCurrency}
      />
    </View>
  );
}
