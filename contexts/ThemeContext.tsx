import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '@/types/database';

interface Theme {
  // Primary colors - Bold pastels
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  
  // Accent colors - Bold pastels
  accent: string;
  accentLight: string;
  accentDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceSecondary: string;
  card: string;
  cardSecondary: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border and divider colors
  border: string;
  borderLight: string;
  borderDark: string;
  divider: string;
  
  // Special colors
  overlay: string;
  shadow: string;
  backdrop: string;
  isDark: boolean;
}

const lightTheme: Theme = {
  // Primary colors - Bold pastels
  primary: '#FF6B9D', // Bold pink
  primaryLight: '#FFB3D1',
  primaryDark: '#E91E63',
  secondary: '#4ECDC4', // Bold teal
  secondaryLight: '#7DD3FC',
  secondaryDark: '#0891B2',
  
  // Accent colors - Bold pastels
  accent: '#A8E6CF', // Bold mint
  accentLight: '#D1FAE5',
  accentDark: '#059669',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: '#FEFEFE',
  backgroundSecondary: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  card: '#FFFFFF',
  cardSecondary: '#F8FAFC',
  
  // Text colors
  text: '#0F172A',
  textSecondary: '#64748B',
  textTertiary: '#94A3B8',
  textInverse: '#FFFFFF',
  
  // Border and divider colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  divider: '#E2E8F0',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadow: 'rgba(0, 0, 0, 0.1)',
  backdrop: 'rgba(0, 0, 0, 0.3)',
  isDark: false,
};

const darkTheme: Theme = {
  // Primary colors - Bold pastels
  primary: '#FF6B9D', // Bold pink
  primaryLight: '#FFB3D1',
  primaryDark: '#E91E63',
  secondary: '#4ECDC4', // Bold teal
  secondaryLight: '#7DD3FC',
  secondaryDark: '#0891B2',
  
  // Accent colors - Bold pastels
  accent: '#A8E6CF', // Bold mint
  accentLight: '#D1FAE5',
  accentDark: '#059669',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Background colors
  background: '#0F0F23',
  backgroundSecondary: '#1A1A2E',
  surface: '#16213E',
  surfaceSecondary: '#0F3460',
  card: '#1E293B',
  cardSecondary: '#334155',
  
  // Text colors
  text: '#F8FAFC',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  textInverse: '#0F172A',
  
  // Border and divider colors
  border: '#334155',
  borderLight: '#475569',
  borderDark: '#1E293B',
  divider: '#334155',
  
  // Special colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  backdrop: 'rgba(0, 0, 0, 0.5)',
  isDark: true,
};

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');

  const getTheme = (): Theme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getTheme();

  return (
    <ThemeContext.Provider value={{ theme, themeMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
