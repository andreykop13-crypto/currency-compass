import React, { useState } from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CurrencyCode, useAppContext } from "@/context/AppContext";
import { useThemeColors } from "@/hooks/useThemeColors";

const CODES: CurrencyCode[] = ["USD", "EUR", "ILS", "RUB", "BYN"];

const copy = {
  ru: {
    eyebrow: "НАСТРОЙКА ЗА 10 СЕКУНД",
    title: "Курсы, которые понятны вам",
    body: "Выберите валюту, в которой вы обычно считаете деньги. Мы покажем относительно неё курсы и стоимость портфеля.",
    label: "Моя основная валюта",
    preview: "Так будет выглядеть курс",
    action: "Показать мои курсы",
  },
  en: {
    eyebrow: "10-SECOND SETUP",
    title: "Rates that make sense to you",
    body: "Choose the currency you normally use. We’ll show exchange rates and your portfolio value relative to it.",
    label: "My main currency",
    preview: "Your rates will look like this",
    action: "Show my rates",
  },
  he: {
    eyebrow: "הגדרה ב־10 שניות",
    title: "שערים שמובנים לך",
    body: "בחר את המטבע שבו אתה משתמש בדרך כלל. נציג ביחס אליו שערים ואת שווי התיק.",
    label: "המטבע הראשי שלי",
    preview: "כך ייראה השער שלך",
    action: "הצג את השערים שלי",
  },
};

export function FirstRunOnboarding() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const { language, currencies, convert, needsOnboarding, completeOnboarding } =
    useAppContext();
  const [selected, setSelected] = useState<CurrencyCode>("USD");
  const c = copy[language];
  const comparison = selected === "USD" ? "EUR" : "USD";
  const styles = StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: insets.top + 36,
      paddingBottom: insets.bottom + 24,
    },
    icon: {
      width: 56,
      height: 56,
      borderRadius: 18,
      backgroundColor: colors.secondary,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 28,
    },
    eyebrow: {
      color: colors.primary,
      fontFamily: "Inter_700Bold",
      fontSize: 12,
      letterSpacing: 1.1,
      marginBottom: 10,
    },
    title: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 32,
      lineHeight: 38,
      letterSpacing: -0.7,
    },
    body: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 16,
      lineHeight: 24,
      marginTop: 12,
    },
    label: {
      color: colors.foreground,
      fontFamily: "Inter_600SemiBold",
      fontSize: 14,
      marginTop: 32,
      marginBottom: 12,
    },
    choices: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    choice: {
      minWidth: "30%",
      flexGrow: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: "center",
      backgroundColor: colors.card,
    },
    choiceActive: {
      borderColor: colors.primary,
      backgroundColor: colors.secondary,
    },
    code: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 15,
    },
    symbol: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
      marginTop: 2,
    },
    preview: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 16,
      marginTop: 20,
    },
    previewLabel: {
      color: colors.mutedForeground,
      fontFamily: "Inter_400Regular",
      fontSize: 12,
    },
    previewRate: {
      color: colors.foreground,
      fontFamily: "Inter_700Bold",
      fontSize: 20,
      marginTop: 5,
    },
    spacer: { flex: 1, minHeight: 20 },
    action: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    actionText: { color: "#FFFFFF", fontFamily: "Inter_700Bold", fontSize: 16 },
  });

  return (
    <Modal visible={needsOnboarding} animationType="fade">
      <View style={styles.page}>
        <View style={styles.icon}>
          <Ionicons name="compass" size={28} color={colors.primary} />
        </View>
        <Text style={styles.eyebrow}>{c.eyebrow}</Text>
        <Text style={styles.title}>{c.title}</Text>
        <Text style={styles.body}>{c.body}</Text>
        <Text style={styles.label}>{c.label}</Text>
        <View style={styles.choices}>
          {CODES.map((code) => (
            <TouchableOpacity
              key={code}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected === code }}
              style={[styles.choice, selected === code && styles.choiceActive]}
              onPress={() => {
                Haptics.selectionAsync();
                setSelected(code);
              }}
            >
              <Text style={styles.code}>{code}</Text>
              <Text style={styles.symbol}>{currencies[code].symbol}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.preview}>
          <Text style={styles.previewLabel}>{c.preview}</Text>
          <Text style={styles.previewRate}>
            1 {selected} = {convert(1, selected, comparison).toFixed(2)}{" "}
            {comparison}
          </Text>
        </View>
        <View style={styles.spacer} />
        <TouchableOpacity
          style={styles.action}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            completeOnboarding(selected);
          }}
        >
          <Text style={styles.actionText}>{c.action}</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
}
