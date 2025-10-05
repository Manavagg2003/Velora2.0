import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeMode } from '@/types/database';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  border: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  accent: string;
  isDark: boolean;
}

const lightTheme: Theme = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#6C757D',
  border: '#DEE2E6',
  error: '#DC3545',
  success: '#28A745',
  warning: '#FFC107',
  info: '#17A2B8',
  accent: '#6F42C1',
  isDark: false,
};

const darkTheme: Theme = {
  primary: '#FF6B35',
  secondary: '#F7931E',
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2A2A2A',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  border: '#3A3A3A',
  error: '#FF6B6B',
  success: '#51CF66',
  warning: '#FFD43B',
  info: '#4DABF7',
  accent: '#9775FA',
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
