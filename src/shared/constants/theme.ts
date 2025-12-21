
export const ZyncTheme = {
  colors: {
    primary: '#CCFF00', // Electric Lime
    background: '#0a0a0a', // Very dark grey/black
    card: '#161616', // Slightly lighter for cards
    text: '#FFFFFF',
    textSecondary: '#A0A0A0',
    border: '#2a2a2a',
    error: '#FF0055',
    success: '#CCFF00',
    overlay: 'rgba(0,0,0,0.8)',
    tabBar: '#121212',
  },
  spacing: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },
  typography: {
    size: {
      xs: 12,
      s: 14,
      m: 16,
      l: 20,
      xl: 24,
      xxl: 32,
    },
    weight: {
      regular: '400',
      medium: '500',
      bold: '700',
      extraBold: '800',
    } as const,
  },
  borderRadius: {
    s: 8,
    m: 12,
    l: 16,
    xl: 24,
    round: 9999,
  },
  shadowGlow: {
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  }
};

// Keeping compatibility with existing Expo templates where needed
export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: ZyncTheme.colors.primary,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: ZyncTheme.colors.primary,
  },
  dark: {
    text: ZyncTheme.colors.text,
    background: ZyncTheme.colors.background,
    tint: ZyncTheme.colors.primary,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: ZyncTheme.colors.primary,
  },
};
