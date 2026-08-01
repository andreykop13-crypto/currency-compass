import { useColors } from '@/hooks/useColors';
import { useColorScheme } from 'react-native';

/** Extends base useColors() with finance-specific semantic tokens. */
export function useThemeColors() {
  const colors = useColors();
  const isDark = useColorScheme() === 'dark';
  return {
    ...colors,
    positive: isDark ? '#00D4A1' : '#00B386',
    positiveBg: isDark ? '#0D2E25' : '#E8FAF4',
    negative: isDark ? '#F87171' : '#EF4444',
    negativeBg: isDark ? '#2E1515' : '#FEF2F2',
    gold: isDark ? '#FBBF24' : '#F59E0B',
    goldBg: isDark ? '#2D2208' : '#FFFBEB',
    gradientStart: isDark ? '#1A2744' : '#0047AB',
    gradientEnd: isDark ? '#0A0E1A' : '#00266B',
    overlay: isDark ? 'rgba(10,14,26,0.85)' : 'rgba(4,12,40,0.6)',
    shadow: isDark ? '#000000' : '#0D1B3E',
  };
}
