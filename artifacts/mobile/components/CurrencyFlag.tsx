import React from 'react';
import { Platform, StyleProp, StyleSheet, Text, TextStyle } from 'react-native';

interface CurrencyFlagProps {
  flag: string;
  size?: number;
  style?: StyleProp<TextStyle>;
}

const webEmojiFont = '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';

/** Keeps regional-indicator pairs in an emoji-capable font instead of the app's Inter face. */
export default function CurrencyFlag({ flag, size = 22, style }: CurrencyFlagProps) {
  return (
    <Text
      accessibilityElementsHidden
      importantForAccessibility="no"
      style={[styles.flag, { fontSize: size }, Platform.OS === 'web' && styles.webFlag, style]}
    >
      {flag}
    </Text>
  );
}

const styles = StyleSheet.create({
  flag: { lineHeight: 28, textAlign: 'center' },
  webFlag: { fontFamily: webEmojiFont },
});
