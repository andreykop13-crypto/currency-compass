import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, Platform, ListRenderItem,
} from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppContext, CurrencyCode, Language } from '@/context/AppContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function generateAIResponse(
  message: string,
  language: Language,
  convert: (amount: number, from: CurrencyCode, to: CurrencyCode) => number,
): string {
  const lower = message.toLowerCase();
  const ilsRate = convert(1, 'USD', 'ILS');
  const eurRate = convert(1, 'USD', 'EUR');

  // Scenario 1: Shekels to buy dollars
  const s1 = lower.includes('шекел') || lower.includes('shekel') || lower.includes('שקל') || lower.includes('scenario1');
  if (s1) {
    const r100 = convert(100, 'USD', 'ILS').toFixed(0);
    const r500 = convert(500, 'USD', 'ILS').toFixed(0);
    const r1000 = convert(1000, 'USD', 'ILS').toFixed(0);
    const r1000spread = (convert(1000, 'USD', 'ILS') * 1.02).toFixed(0);
    const spreadDiff = (convert(1000, 'USD', 'ILS') * 0.02).toFixed(0);
    if (language === 'ru') return `Расчёт по курсу: 1 USD = ${ilsRate.toFixed(2)} ILS\n\nСколько шекелей нужно:\n  $100   →  ${r100} ILS\n  $500   →  ${r500} ILS\n  $1 000 →  ${r1000} ILS\n\nС учётом спреда обменника 2%:\n  $1 000 → ${r1000spread} ILS (+${spreadDiff} ILS)\n\nСравнивайте курсы в нескольких обменниках — разница может быть существенной.\n\nРасчёт носит информационный характер.`;
    if (language === 'en') return `Rate: 1 USD = ${ilsRate.toFixed(2)} ILS\n\nShekels needed:\n  $100   →  ${r100} ILS\n  $500   →  ${r500} ILS\n  $1,000 →  ${r1000} ILS\n\nWith 2% exchange bureau spread:\n  $1,000 → ${r1000spread} ILS (+${spreadDiff} ILS extra)\n\nCompare rates at multiple bureaus.\n\nInformational calculation only.`;
    return `שער: 1 USD = ${ilsRate.toFixed(2)} ILS\n\nכמה שקלים נדרשים:\n  $100 → ${r100} ILS\n  $500 → ${r500} ILS\n  $1,000 → ${r1000} ILS\n\nהחישוב הוא לצורכי מידע בלבד.`;
  }

  // Scenario 2: Trade profit
  const s2 = lower.includes('прибыл') || lower.includes('profit') || lower.includes('רווח') ||
    lower.includes('покупк') || lower.includes('продаж') || lower.includes('scenario2') || lower.includes('сделк');
  if (s2) {
    const amount = 1000;
    const buyR = ilsRate * 0.995;
    const sellR = ilsRate * 1.005;
    const cost = amount * buyR;
    const revenue = amount * sellR;
    const gross = revenue - cost;
    const commFee = revenue * 0.005;
    const net = gross - commFee;
    const margin = (net / cost * 100).toFixed(2);
    if (language === 'ru') return `Пример расчёта прибыли:\n\nИсходные данные:\n  Сумма: $${amount}\n  Курс покупки: ${buyR.toFixed(2)} ILS\n  Курс продажи: ${sellR.toFixed(2)} ILS\n  Комиссия: 0.5%\n\nРезультат:\n  Стоимость:         ${cost.toFixed(2)} ILS\n  Выручка:           ${revenue.toFixed(2)} ILS\n  Валовая прибыль:   +${gross.toFixed(2)} ILS\n  Комиссия:          −${commFee.toFixed(2)} ILS\n  Чистая прибыль:    +${net.toFixed(2)} ILS\n  Маржа:             ${margin}%\n\nДля своих цифр используйте Калькулятор сделки в разделе Кошелёк.\nРасчёт носит информационный характер.`;
    if (language === 'en') return `Sample trade profit:\n\nInputs:\n  Amount: $${amount}\n  Buy rate: ${buyR.toFixed(2)} ILS\n  Sell rate: ${sellR.toFixed(2)} ILS\n  Commission: 0.5%\n\nResults:\n  Cost:        ${cost.toFixed(2)} ILS\n  Revenue:     ${revenue.toFixed(2)} ILS\n  Gross profit: +${gross.toFixed(2)} ILS\n  Commission:  −${commFee.toFixed(2)} ILS\n  Net profit:  +${net.toFixed(2)} ILS\n  Margin:      ${margin}%\n\nUse the Deal Calculator for your own numbers.\nInformational only.`;
    return `חישוב רווח לדוגמה:\n\nסכום: $${amount}\nשער קנייה: ${buyR.toFixed(2)}\nשער מכירה: ${sellR.toFixed(2)}\n\nרווח נקי: +${net.toFixed(2)} ILS\nמרווח: ${margin}%\n\nלצורכי מידע בלבד.`;
  }

  // Scenario 3: Market rate vs bureau
  const s3 = lower.includes('рыночн') || lower.includes('market') || lower.includes('שוק') ||
    lower.includes('обменник') || lower.includes('חלפן') || lower.includes('scenario3') || lower.includes('разниц');
  if (s3) {
    const market = ilsRate;
    const buy = (market * 0.978).toFixed(2);
    const sell = (market * 1.022).toFixed(2);
    const loss = (market * 0.022 * 1000).toFixed(0);
    if (language === 'ru') return `Рыночный курс vs курс обменника:\n\nРыночный (межбанковский):\n  1 USD = ${market.toFixed(2)} ILS\n  Доступен только банкам.\n\nКурс обменника (розничный):\n  Покупка у вас:  ${buy} ILS  (−2.2%)\n  Продажа вам:    ${sell} ILS  (+2.2%)\n  Спред:          4.4%\n\nЧто теряет клиент при $1 000:\n  При покупке:        −${loss} ILS\n  При продаже:        −${loss} ILS\n  На круговой сделке: −${(parseInt(loss) * 2)} ILS\n\nКак сэкономить:\n  Сравнивайте курсы онлайн до обмена\n  Крупные суммы → банк, не обменник\n\nВсе данные носят информационный характер.`;
    if (language === 'en') return `Market rate vs exchange bureau:\n\nInterbank rate:\n  1 USD = ${market.toFixed(2)} ILS\n  Available between banks only.\n\nExchange bureau (retail):\n  Buy from you:  ${buy} ILS  (−2.2%)\n  Sell to you:   ${sell} ILS  (+2.2%)\n  Spread:        4.4%\n\nCost on $1,000:\n  Buying USD:    −${loss} ILS\n  Selling USD:   −${loss} ILS\n  Round-trip:    −${parseInt(loss) * 2} ILS\n\nTips:\n  Compare rates online before going\n  Larger amounts often get better rates\n\nAll data is informational only.`;
    return `שער שוק מול חלפן:\n\nשער בינבנקאי: 1 USD = ${market.toFixed(2)} ILS\n\nחלפן:\n  קנייה מכם: ${buy} ILS\n  מכירה לכם: ${sell} ILS\n  ספרד: 4.4%\n\nהפסד על $1,000: −${loss} ILS\n\nלצורכי מידע בלבד.`;
  }

  // General fallback
  if (language === 'ru') return 'Я помогу с расчётами по обмену валют. Выберите сценарий выше или уточните вопрос:\n\n  — Сколько шекелей нужно для покупки долларов\n  — Расчёт прибыли от курсовой разницы\n  — Разница между рыночным курсом и курсом обменника\n\nРасчёты носят информационный характер.';
  if (language === 'en') return 'I can help with currency calculations. Choose a scenario or ask specifically:\n\n  — Shekels needed to buy dollars\n  — Profit from exchange rate difference\n  — Market rate vs exchange bureau\n\nAll calculations are informational only.';
  return 'אני יכול לעזור בחישובי המרה. בחר תרחיש או שאל שאלה ספציפית.\n\nכל החישובים הם לצורכי מידע בלבד.';
}

export default function AIScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const t = useTranslation();
  const { convert, language } = useAppContext();
  const isWeb = Platform.OS === 'web';

  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '0', role: 'assistant', content: t('aiWelcome') },
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const topPad = isWeb ? 67 : insets.top;
  const btmPad = isWeb ? 34 : insets.bottom;

  const sendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMsg: ChatMessage = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
      role: 'user',
      content: trimmed,
    };
    setMessages(prev => [userMsg, ...prev]);
    setInputText('');
    setIsThinking(true);

    const capturedText = trimmed;
    const capturedLang = language;
    setTimeout(() => {
      const response = generateAIResponse(capturedText, capturedLang, convert);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString() + Math.random().toString(36).substr(2, 5),
        role: 'assistant',
        content: response,
      };
      setMessages(prev => [aiMsg, ...prev]);
      setIsThinking(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 900);
  };

  const scenarios = [
    { key: 'scenario1', label: t('scenario1') },
    { key: 'scenario2', label: t('scenario2') },
    { key: 'scenario3', label: t('scenario3') },
  ];

  const s = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    disclaimer: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: colors.muted,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      alignItems: 'center',
    },
    disclaimerText: {
      flex: 1,
      fontSize: 12,
      fontFamily: 'Inter_400Regular',
      color: colors.mutedForeground,
      lineHeight: 17,
    },
    scenariosArea: {
      paddingHorizontal: 12,
      paddingVertical: 10,
      flexDirection: 'row',
      gap: 8,
      flexWrap: 'wrap',
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    scenarioChip: {
      backgroundColor: colors.secondary,
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    },
    scenarioChipText: {
      fontSize: 13,
      fontFamily: 'Inter_500Medium',
      color: colors.primary,
    },
    listContainer: { flex: 1 },
    listContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 8,
    },
    // Messages
    messageBubble: {
      maxWidth: '82%',
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 10,
      marginBottom: 8,
    },
    userBubble: {
      backgroundColor: colors.primary,
      alignSelf: 'flex-end',
      borderBottomRightRadius: 4,
    },
    assistantBubble: {
      backgroundColor: colors.card,
      alignSelf: 'flex-start',
      borderBottomLeftRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    userText: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: '#FFFFFF',
      lineHeight: 22,
    },
    assistantText: {
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      lineHeight: 22,
    },
    thinkingBubble: {
      backgroundColor: colors.card,
      borderRadius: 18,
      borderBottomLeftRadius: 4,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      alignSelf: 'flex-start',
      marginBottom: 8,
      gap: 4,
      borderWidth: 1,
      borderColor: colors.border,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 3.5,
      backgroundColor: colors.mutedForeground,
    },
    // Input area
    inputArea: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 10,
      paddingHorizontal: 12,
      paddingTop: 10,
      paddingBottom: btmPad + 10,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      backgroundColor: colors.background,
    },
    input: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: 22,
      paddingHorizontal: 16,
      paddingVertical: Platform.OS === 'ios' ? 10 : 8,
      fontSize: 15,
      fontFamily: 'Inter_400Regular',
      color: colors.foreground,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 100,
    },
    sendBtn: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendBtnDisabled: {
      backgroundColor: colors.muted,
    },
    headerArea: {
      paddingTop: topPad + 8,
      paddingBottom: 0,
    },
  });

  const renderItem: ListRenderItem<ChatMessage> = ({ item }) => (
    <View style={[s.messageBubble, item.role === 'user' ? s.userBubble : s.assistantBubble]}>
      <Text style={item.role === 'user' ? s.userText : s.assistantText}>{item.content}</Text>
    </View>
  );

  const ThinkingIndicator = () => (
    <View style={s.thinkingBubble}>
      <View style={[s.dot, { opacity: 0.3 }]} />
      <View style={[s.dot, { opacity: 0.6 }]} />
      <View style={[s.dot, { opacity: 1 }]} />
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={s.container}
      behavior="padding"
      keyboardVerticalOffset={0}
    >
      <View style={s.headerArea} />
      {/* Disclaimer banner */}
      <View style={s.disclaimer}>
        <Feather name="shield" size={14} color={colors.mutedForeground} />
        <Text style={s.disclaimerText}>{t('aiDisclaimer')}</Text>
      </View>

      {/* Scenario chips */}
      <View style={s.scenariosArea}>
        {scenarios.map(sc => (
          <TouchableOpacity
            key={sc.key}
            style={s.scenarioChip}
            onPress={() => sendMessage(sc.key)}
            activeOpacity={0.7}
          >
            <Text style={s.scenarioChipText}>{sc.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Chat list */}
      <View style={s.listContainer}>
        <FlatList
          data={messages}
          inverted
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={s.listContent}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={isThinking ? <ThinkingIndicator /> : null}
          scrollEnabled={!!messages.length}
        />
      </View>

      {/* Input */}
      <View style={s.inputArea}>
        <TextInput
          style={s.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder={t('typeMessage')}
          placeholderTextColor={colors.mutedForeground}
          multiline
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(inputText)}
          blurOnSubmit
          selectionColor={colors.primary}
        />
        <TouchableOpacity
          style={[s.sendBtn, (!inputText.trim() || isThinking) && s.sendBtnDisabled]}
          onPress={() => sendMessage(inputText)}
          disabled={!inputText.trim() || isThinking}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-up" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
