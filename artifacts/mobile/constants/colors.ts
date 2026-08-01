/**
 * Premium fintech color palette — cobalt blue primary, finance green accent.
 * Light and dark themes with the same token names so useColors() auto-picks dark mode.
 */

const colors = {
  light: {
    text: '#0D1117',
    tint: '#0047AB',
    background: '#F4F6FB',
    foreground: '#0D1117',
    card: '#FFFFFF',
    cardForeground: '#0D1117',
    primary: '#0047AB',
    primaryForeground: '#FFFFFF',
    secondary: '#EEF2FF',
    secondaryForeground: '#0047AB',
    muted: '#F1F4F9',
    mutedForeground: '#6B7280',
    accent: '#00B386',
    accentForeground: '#FFFFFF',
    destructive: '#EF4444',
    destructiveForeground: '#FFFFFF',
    border: '#E5E9F0',
    input: '#E5E9F0',
  },
  dark: {
    text: '#F0F6FF',
    tint: '#5B9BFF',
    background: '#0A0E1A',
    foreground: '#F0F6FF',
    card: '#131926',
    cardForeground: '#F0F6FF',
    primary: '#5B9BFF',
    primaryForeground: '#FFFFFF',
    secondary: '#1A2338',
    secondaryForeground: '#A0BCFF',
    muted: '#1A2338',
    mutedForeground: '#7C8FA8',
    accent: '#00D4A1',
    accentForeground: '#FFFFFF',
    destructive: '#F87171',
    destructiveForeground: '#FFFFFF',
    border: '#232E42',
    input: '#232E42',
  },
  radius: 16,
};

export default colors;
