import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Modal, Platform, FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext, CurrencyCode, CURRENCIES } from '@/context/AppContext';

const CURRENCY_CODES: CurrencyCode[] = ['USD', 'EUR', 'ILS', 'RUB', 'BYN'];
const SYM: Record<CurrencyCode, string> = { USD: '$', EUR: '€', ILS: '₪', RUB: '₽', BYN: 'Br' };

interface DealResult {
  cost: number;
  revenue: number;
  grossProfit: number;
  commissionFee: number;
  netProfit: number;
  margin: number;
}

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useTranslation();
  const {
    walletBalances, addBalance, removeBalance,
    baseCurrency, setBaseCurrency,
    convert, formatAmount, getCurrencyName,
  } = useAppContext();

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const btmPad = isWeb ? 34 : 90;

  // Add balance modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addCurrency, setAddCurrency] = useState<CurrencyCode>('USD');
  const [addAmountText, setAddAmountText] = useState('');
  const [showBasePicker, setShowBasePicker] = useState(false);

  // Deal calculator
  const [dealAmount, setDealAmount] = useState('');
  const [dealBuyRate, setDealBuyRate] = useState('');
  const [dealSellRate, setDealSellRate] = useState('');
  const [dealCommission, setDealCommission] = useState('0.5');
  const [dealResult, setDealResult] = useState<DealResult | null>(null);

  // Total portfolio value
  const totalValueUSD = walletBalances.reduce((sum, b) => {
    return sum + convert(b.amount, b.currency, 'USD');
  }, 0);
  const totalValue = convert(totalValueUSD, 'USD', baseCurrency);

  const handleAddBalance = () => {
    const amount = parseFloat(addAmountText.replace(/[^0-9.]/g, ''));
    if (!amount || amount <= 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addBalance(addCurrency, amount);
    setAddAmountText('');
    setShowAddModal(false);
  };

  const handleRemoveBalance = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    removeBalance(id);
  };

  const calculateDeal = () => {
    const amount = parseFloat(dealAmount.replace(/[^0-9.]/g, ''));
    const buyRate = parseFloat(dealBuyRate.replace(/[^0-9.]/g, ''));
    const sellRate = parseFloat(dealSellRate.replace(/[^0-9.]/g, ''));
    const commission = parseFloat(dealCommission.replace(/[^0-9.]/g, '')) || 0;
    if (!amount || !buyRate || !sellRate) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const cost = amount * buyRate;
    const revenue = amount * sellRate;
    const grossProfit = revenue - cost;
    const commissionFee = revenue * (commission / 100);
    const netProfit = grossProfit - commissionFee;
    const margin = cost > 0 ? (netProfit / cost) * 100 : 0;

    setDealResult({ cost, revenue, grossProfit, commissionFee, netProfit, margin });
  };

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { paddingBottom: btmPad },
    header: {
      paddingHorizontal: 20,
      paddingTop: topPad + 8,
      paddingBottom: 4,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    headerTitle: {
      fontSize: 28,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      letterSpacing: -0.5,
    },
    addBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: colors.primary,
      borderRadius: 20,
      paddingHorizontal: 14,
      paddingVertical: 8,
    },
    addBtnText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    // Portfolio card
    portfolioCard: {
      marginHorizontal: 20,
      marginTop: 16,
      borderRadius: colors.radius,
      overflow: 'hidden',
    },
    portfolioGrad: {
      padding: 20,
    },
    portfolioLabel: {
      fontSize: 11,
      fontFamily: 'Inter_600SemiBold',
      color: 'rgba(255,255,255,0.65)',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: 8,
    },
    portfolioValue: {
      fontSize: 44,
      fontFamily: 'Inter_700Bold',
      color: '#FFFFFF',
      letterSpacing: -1.5,
    },
    portfolioSym: {
      fontSize: 22,
      fontFamily: 'Inter_400Regular',
      color: 'rgba(255,255,255,0.7)',
    },
    portfolioRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 4,
      marginBottom: 16,
    },
    baseSelectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    baseSelectorLabel: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: 'rgba(255,255,255,0.65)',
    },
    baseSelectorBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: 'rgba(255,255,255,0.2)',
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    baseSelectorCode: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    // Section
    sectionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      marginTop: 20,
      marginBottom: 10,
    },
    sectionLabel: {
      fontSize: 12,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
    },
    // Balance rows
    balanceCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    balanceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    balanceLeft: {
      flex: 1,
      gap: 2,
    },
    balanceCode: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
    },
    balanceName: {
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    balanceCenter: {
      flex: 1,
      alignItems: 'center',
    },
    balanceAmount: {
      fontSize: 18,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    balanceRight: {
      flex: 1,
      alignItems: 'flex-end',
      gap: 2,
    },
    balanceConverted: {
      fontSize: 14,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    deleteBtn: {
      paddingLeft: 12,
      paddingVertical: 4,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 40,
      gap: 8,
    },
    emptyText: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
    },
    emptySubtext: {
      fontSize: 13,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    // Deal calculator
    dealCard: {
      marginHorizontal: 20,
      backgroundColor: colors.card,
      borderRadius: colors.radius,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      gap: 12,
    },
    dealInputRow: {
      gap: 4,
    },
    dealLabel: {
      fontSize: 12,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      letterSpacing: 0.3,
    },
    dealInput: {
      backgroundColor: colors.muted,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 17,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dealRow2: {
      flexDirection: 'row',
      gap: 10,
    },
    dealRow2Item: {
      flex: 1,
      gap: 4,
    },
    calcBtn: {
      backgroundColor: colors.primary,
      borderRadius: colors.radius,
      paddingVertical: 14,
      alignItems: 'center',
    },
    calcBtnText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    // Results
    resultsCard: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      padding: 14,
      gap: 8,
    },
    resultRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    resultLabel: {
      fontSize: 14,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
    },
    resultValue: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
    },
    divider: { height: 1, backgroundColor: colors.border },
    resultProfit: {
      fontSize: 18,
      fontFamily: 'Inter_700Bold',
    },
    resultMargin: {
      fontSize: 16,
      fontFamily: 'Inter_700Bold',
    },
    // Modals
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
      paddingHorizontal: 20,
    },
    modalHandle: {
      width: 36, height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 16,
    },
    modalTitle: {
      fontSize: 20,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      marginBottom: 20,
    },
    modalLabel: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.mutedForeground,
      marginBottom: 8,
    },
    modalInput: {
      backgroundColor: colors.muted,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 22,
      fontFamily: 'Inter_600SemiBold',
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: 16,
    },
    currencyTabs: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 20,
    },
    currencyTab: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.muted,
      borderWidth: 1,
      borderColor: colors.border,
    },
    currencyTabActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    currencyTabText: {
      fontSize: 14,
      fontFamily: 'Inter_600SemiBold',
      color: colors.mutedForeground,
    },
    currencyTabTextActive: {
      color: '#FFFFFF',
    },
    modalBtns: {
      flexDirection: 'row',
      gap: 10,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.muted,
      alignItems: 'center',
    },
    cancelBtnText: {
      fontSize: 16,
      fontFamily: 'Inter_500Medium',
      color: colors.foreground,
    },
    confirmBtn: {
      flex: 2,
      paddingVertical: 14,
      borderRadius: colors.radius,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    confirmBtnText: {
      fontSize: 16,
      fontFamily: 'Inter_600SemiBold',
      color: '#FFFFFF',
    },
    // Picker
    pickerSheet: {
      backgroundColor: colors.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingBottom: isWeb ? 34 : insets.bottom + 20,
    },
    pickerHandle: {
      width: 36, height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: 12,
    },
    pickerTitle: {
      fontSize: 18,
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
      fontSize: 17,
      fontFamily: 'Inter_700Bold',
      color: colors.foreground,
      width: 42,
    },
    pickerSym: {
      fontSize: 17,
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
  });

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>{t('portfolio')}</Text>
          <TouchableOpacity
            style={s.addBtn}
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowAddModal(true); }}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={s.addBtnText}>{t('addCurrency')}</Text>
          </TouchableOpacity>
        </View>

        {/* Portfolio value card */}
        <View style={s.portfolioCard}>
          <LinearGradient
            colors={[colors.gradientStart, colors.gradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={s.portfolioGrad}
          >
            <Text style={s.portfolioLabel}>{t('totalValue')}</Text>
            <View style={s.portfolioRow}>
              <Text style={s.portfolioSym}>{SYM[baseCurrency]}</Text>
              <Text style={s.portfolioValue}>{formatAmount(totalValue)}</Text>
            </View>
            <View style={s.baseSelectorRow}>
              <Text style={s.baseSelectorLabel}>{t('inBase')}</Text>
              <TouchableOpacity
                style={s.baseSelectorBtn}
                onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setShowBasePicker(true); }}
              >
                <Text style={s.baseSelectorCode}>{baseCurrency}</Text>
                <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Balances */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>{getCurrencyName('USD').includes('Д') ? 'Валюты' : 'Currencies'}</Text>
        </View>
        <View style={s.balanceCard}>
          {walletBalances.length === 0 ? (
            <View style={s.emptyState}>
              <Feather name="inbox" size={32} color={colors.mutedForeground} />
              <Text style={s.emptyText}>{t('noCurrencies')}</Text>
              <Text style={s.emptySubtext}>{t('addFirstCurrency')}</Text>
            </View>
          ) : (
            walletBalances.map((balance, idx) => {
              const inBase = convert(balance.amount, balance.currency, baseCurrency);
              return (
                <View key={balance.id} style={[s.balanceRow, idx === walletBalances.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={s.balanceLeft}>
                    <Text style={s.balanceCode}>{balance.currency}</Text>
                    <Text style={s.balanceName}>{SYM[balance.currency]}</Text>
                  </View>
                  <View style={s.balanceCenter}>
                    <Text style={s.balanceAmount}>
                      {SYM[balance.currency]}{formatAmount(balance.amount)}
                    </Text>
                  </View>
                  <View style={s.balanceRight}>
                    <Text style={s.balanceConverted}>
                      {SYM[baseCurrency]}{formatAmount(inBase)}
                    </Text>
                    <TouchableOpacity style={s.deleteBtn} onPress={() => handleRemoveBalance(balance.id)}>
                      <Feather name="trash-2" size={16} color={colors.negative} />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Deal Calculator */}
        <View style={s.sectionRow}>
          <Text style={s.sectionLabel}>{t('dealCalc')}</Text>
        </View>
        <View style={s.dealCard}>
          {/* Amount */}
          <View style={s.dealInputRow}>
            <Text style={s.dealLabel}>{t('dealAmount')}</Text>
            <TextInput
              style={s.dealInput}
              value={dealAmount}
              onChangeText={setDealAmount}
              keyboardType="decimal-pad"
              placeholder="1 000"
              placeholderTextColor={colors.mutedForeground}
              selectionColor={colors.primary}
            />
          </View>

          {/* Buy/Sell rates */}
          <View style={s.dealRow2}>
            <View style={s.dealRow2Item}>
              <Text style={s.dealLabel}>{t('buyRate')}</Text>
              <TextInput
                style={s.dealInput}
                value={dealBuyRate}
                onChangeText={setDealBuyRate}
                keyboardType="decimal-pad"
                placeholder="3.65"
                placeholderTextColor={colors.mutedForeground}
                selectionColor={colors.primary}
              />
            </View>
            <View style={s.dealRow2Item}>
              <Text style={s.dealLabel}>{t('sellRate')}</Text>
              <TextInput
                style={s.dealInput}
                value={dealSellRate}
                onChangeText={setDealSellRate}
                keyboardType="decimal-pad"
                placeholder="3.72"
                placeholderTextColor={colors.mutedForeground}
                selectionColor={colors.primary}
              />
            </View>
          </View>

          {/* Commission */}
          <View style={s.dealInputRow}>
            <Text style={s.dealLabel}>{t('commission')}</Text>
            <TextInput
              style={s.dealInput}
              value={dealCommission}
              onChangeText={setDealCommission}
              keyboardType="decimal-pad"
              placeholder="0.5"
              placeholderTextColor={colors.mutedForeground}
              selectionColor={colors.primary}
            />
          </View>

          {/* Calculate button */}
          <TouchableOpacity style={s.calcBtn} onPress={calculateDeal} activeOpacity={0.85}>
            <Text style={s.calcBtnText}>{t('calculate')}</Text>
          </TouchableOpacity>

          {/* Results */}
          {dealResult ? (
            <View style={s.resultsCard}>
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('cost')}</Text>
                <Text style={s.resultValue}>{dealResult.cost.toFixed(2)}</Text>
              </View>
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('revenue')}</Text>
                <Text style={s.resultValue}>{dealResult.revenue.toFixed(2)}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('grossProfit')}</Text>
                <Text style={[s.resultValue, { color: dealResult.grossProfit >= 0 ? colors.positive : colors.negative }]}>
                  {dealResult.grossProfit >= 0 ? '+' : ''}{dealResult.grossProfit.toFixed(2)}
                </Text>
              </View>
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('commissionFee')}</Text>
                <Text style={[s.resultValue, { color: colors.negative }]}>
                  −{dealResult.commissionFee.toFixed(2)}
                </Text>
              </View>
              <View style={s.divider} />
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('netProfit')}</Text>
                <Text style={[s.resultProfit, { color: dealResult.netProfit >= 0 ? colors.positive : colors.negative }]}>
                  {dealResult.netProfit >= 0 ? '+' : ''}{dealResult.netProfit.toFixed(2)}
                </Text>
              </View>
              <View style={s.resultRow}>
                <Text style={s.resultLabel}>{t('margin')}</Text>
                <Text style={[s.resultMargin, { color: dealResult.margin >= 0 ? colors.positive : colors.negative }]}>
                  {dealResult.margin >= 0 ? '+' : ''}{dealResult.margin.toFixed(2)}%
                </Text>
              </View>
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.mutedForeground }}>
                {t('enterValues')}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Balance Modal */}
      <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowAddModal(false)}>
          <TouchableOpacity activeOpacity={1}>
            <View style={s.modalSheet}>
              <View style={s.modalHandle} />
              <Text style={s.modalTitle}>{t('addCurrency')}</Text>
              <Text style={s.modalLabel}>{t('selectCurrency' as any) ?? 'Валюта'}</Text>
              <View style={s.currencyTabs}>
                {CURRENCY_CODES.map(code => (
                  <TouchableOpacity
                    key={code}
                    style={[s.currencyTab, addCurrency === code && s.currencyTabActive]}
                    onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAddCurrency(code); }}
                  >
                    <Text style={[s.currencyTabText, addCurrency === code && s.currencyTabTextActive]}>
                      {code}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={s.modalLabel}>{t('enterAmount')}</Text>
              <TextInput
                style={s.modalInput}
                value={addAmountText}
                onChangeText={setAddAmountText}
                keyboardType="decimal-pad"
                placeholder={`${SYM[addCurrency]}0.00`}
                placeholderTextColor={colors.mutedForeground}
                selectionColor={colors.primary}
                autoFocus
              />
              <View style={s.modalBtns}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setShowAddModal(false)}>
                  <Text style={s.cancelBtnText}>{t('cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.confirmBtn} onPress={handleAddBalance}>
                  <Text style={s.confirmBtnText}>{t('save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Base currency picker */}
      <Modal visible={showBasePicker} animationType="slide" transparent onRequestClose={() => setShowBasePicker(false)}>
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setShowBasePicker(false)}>
          <TouchableOpacity activeOpacity={1}>
            <View style={s.pickerSheet}>
              <View style={s.pickerHandle} />
              <Text style={s.pickerTitle}>{t('baseCurrency')}</Text>
              <FlatList
                data={CURRENCY_CODES}
                keyExtractor={item => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[s.pickerRow, item === baseCurrency && { backgroundColor: colors.secondary }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setBaseCurrency(item);
                      setShowBasePicker(false);
                    }}
                  >
                    <Text style={s.pickerCode}>{item}</Text>
                    <Text style={s.pickerSym}>{SYM[item]}</Text>
                    <Text style={s.pickerName}>{getCurrencyName(item)}</Text>
                    {item === baseCurrency && <Ionicons name="checkmark" size={18} color={colors.primary} />}
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
