import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
  textStyle,
}: BadgeProps) {
  const { theme } = useTheme();

  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'flex-start',
    };

    const sizeStyles: Record<string, ViewStyle> = {
      sm: { paddingHorizontal: 8, paddingVertical: 4, minHeight: 20 },
      md: { paddingHorizontal: 12, paddingVertical: 6, minHeight: 24 },
      lg: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 28 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        backgroundColor: theme.primary,
      },
      secondary: {
        backgroundColor: theme.secondary,
      },
      success: {
        backgroundColor: theme.success,
      },
      warning: {
        backgroundColor: theme.warning,
      },
      error: {
        backgroundColor: theme.error,
      },
      info: {
        backgroundColor: theme.info,
      },
      gradient: {
        // Will be handled by LinearGradient
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontWeight: '600',
      textAlign: 'center',
    };

    const sizeStyles: Record<string, TextStyle> = {
      sm: { fontSize: 10 },
      md: { fontSize: 12 },
      lg: { fontSize: 14 },
    };

    const variantStyles: Record<string, TextStyle> = {
      default: { color: theme.textInverse },
      secondary: { color: theme.textInverse },
      success: { color: theme.textInverse },
      warning: { color: theme.textInverse },
      error: { color: theme.textInverse },
      info: { color: theme.textInverse },
      gradient: { color: theme.textInverse },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...textStyle,
    };
  };

  if (variant === 'gradient') {
    return (
      <LinearGradient
        colors={[theme.primary, theme.secondary]}
        style={[getBadgeStyle(), style]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={getTextStyle()}>{children}</Text>
      </LinearGradient>
    );
  }

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={getTextStyle()}>{children}</Text>
    </View>
  );
}
