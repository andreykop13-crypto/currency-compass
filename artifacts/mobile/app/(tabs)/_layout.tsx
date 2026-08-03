import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useThemeColors } from '@/hooks/useThemeColors';
import { useTranslation } from '@/hooks/useTranslation';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';

const tabs = [
  { name: 'index', label: 'converterTab' as const, icon: 'calculator', selected: 'calculator.fill', fallback: 'calculator-outline' as const },
  { name: 'rates', label: 'ratesTab' as const, icon: 'chart.line.uptrend.xyaxis', selected: 'chart.line.uptrend.xyaxis', fallback: 'stats-chart-outline' as const },
  { name: 'settings', label: 'settings' as const, icon: 'gearshape', selected: 'gearshape.fill', fallback: 'settings-outline' as const },
];

function NativeTabLayout() {
  const t = useTranslation();
  return <NativeTabs>{tabs.map((tab) => <NativeTabs.Trigger name={tab.name} key={tab.name}>
    <Icon sf={{ default: tab.icon as never, selected: tab.selected as never }} /><Label>{t(tab.label)}</Label>
  </NativeTabs.Trigger>)}</NativeTabs>;
}

function ClassicTabLayout() {
  const colors = useThemeColors();
  const t = useTranslation();
  const isDark = useColorScheme() === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  return <Tabs screenOptions={{
    headerShown: false, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.mutedForeground,
    tabBarStyle: { position: 'absolute', backgroundColor: isIOS ? 'transparent' : colors.background,
      borderTopWidth: isWeb ? 1 : 0, borderTopColor: colors.border, elevation: 0, ...(isWeb ? { height: 84 } : {}) },
    tabBarBackground: () => isIOS
      ? <BlurView intensity={100} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
      : isWeb ? <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]} /> : null,
  }}>
    {tabs.map((tab) => <Tabs.Screen key={tab.name} name={tab.name} options={{ title: t(tab.label),
      tabBarIcon: ({ color }) => isIOS ? <SymbolView name={tab.icon as never} tintColor={color} size={24} />
        : <Ionicons name={tab.fallback} size={22} color={color} /> }} />)}
  </Tabs>;
}

export default function TabLayout() {
  return isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />;
}
