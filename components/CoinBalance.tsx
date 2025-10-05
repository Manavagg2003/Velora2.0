import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Coins } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';

export function CoinBalance() {
  const { theme } = useTheme();
  const { profile } = useProfile();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <Coins size={20} color={theme.secondary} />
      <Text style={[styles.balance, { color: theme.text }]}>
        {profile?.coin_balance || 0}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  balance: {
    fontSize: 16,
    fontWeight: '700',
  },
});
