import React from 'react';
import {
  View,
  StyleSheet,
  ViewStyle,
  TouchableOpacity,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';

interface CardProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'gradient';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  style?: ViewStyle;
  onPress?: () => void;
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  onPress,
  ...props
}: CardProps) {
  const { theme } = useTheme();

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 16,
      backgroundColor: theme.card,
    };

    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      sm: { padding: 12 },
      md: { padding: 16 },
      lg: { padding: 20 },
    };

    const variantStyles: Record<string, ViewStyle> = {
      default: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      elevated: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
        elevation: 8,
      },
      outlined: {
        borderWidth: 1,
        borderColor: theme.border,
        shadowOpacity: 0,
        elevation: 0,
      },
      gradient: {
        shadowColor: theme.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
      },
    };

    return {
      ...baseStyle,
      ...paddingStyles[padding],
      ...variantStyles[variant],
    };
  };

  const CardContent = () => (
    <View style={[getCardStyle(), style]}>
      {children}
    </View>
  );

  if (variant === 'gradient') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        activeOpacity={0.9}
        {...props}
      >
        <LinearGradient
          colors={[theme.card, theme.cardSecondary]}
          style={[getCardStyle(), style]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {children}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.9}
        {...props}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

export function CardHeader({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.header, { borderBottomColor: theme.border }, style]}>
      {children}
    </View>
  );
}

export function CardContent({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
}

export function CardFooter({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  const { theme } = useTheme();

  return (
    <View style={[styles.footer, { borderTopColor: theme.border }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    marginBottom: 12,
  },
  content: {
    flex: 1,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    marginTop: 12,
  },
});
