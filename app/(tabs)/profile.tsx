import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { User, Coins, Crown, LogOut, Settings, Moon, Sun } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { SUBSCRIPTION_PLANS } from '@/types/database';
import { paymentService } from '@/services/payment.service';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { theme, themeMode, setThemeMode } = useTheme();
  const { user, signOut } = useAuth();
  const { profile, preferences, updatePreferences } = useProfile();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const toggleTheme = async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newMode);
    if (preferences) {
      await updatePreferences({ theme: newMode });
    }
  };

  const handleUpgrade = async (tier: string) => {
    try {
      const plan = SUBSCRIPTION_PLANS.find(p => p.tier === tier);
      if (!plan || !plan.price) return;
      // Razorpay expects amount in paise
      const amountInPaise = plan.price * 100;
      const order = await paymentService.createOrder(amountInPaise, { tier });
      // Navigate to a simple web checkout page or invoke native SDK (webview approach here)
      router.push({
        pathname: '/payment',
        params: {
          order_id: order.order.id,
          key_id: order.key_id,
          amount: String(amountInPaise),
          tier,
        },
      } as any);
    } catch (e: any) {
      Alert.alert('Payment Error', e?.message || 'Failed to start payment');
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Profile
        </Text>
      </View>

      <Card style={styles.profileCard}>
        <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
          <User size={40} color="#FFFFFF" />
        </View>
        <Text style={[styles.name, { color: theme.text }]}>
          {profile?.full_name || 'Chef'}
        </Text>
        <Text style={[styles.email, { color: theme.textSecondary }]}>
          {profile?.email}
        </Text>
        <View style={[styles.badge, { backgroundColor: theme.secondary + '20' }]}>
          <Crown size={16} color={theme.secondary} />
          <Text style={[styles.badgeText, { color: theme.secondary }]}>
            {profile?.subscription_tier?.toUpperCase() || 'FREE'}
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Coin Balance
        </Text>
        <Card>
          <View style={styles.coinCard}>
            <View style={[styles.coinIcon, { backgroundColor: theme.secondary + '20' }]}>
              <Coins size={32} color={theme.secondary} />
            </View>
            <View style={styles.coinInfo}>
              <Text style={[styles.coinBalance, { color: theme.text }]}>
                {profile?.coin_balance || 0}
              </Text>
              <Text style={[styles.coinLabel, { color: theme.textSecondary }]}>
                Available Coins
              </Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Subscription Plans
        </Text>
        {SUBSCRIPTION_PLANS.map((plan) => (
          <Card key={plan.tier} style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={[styles.planName, { color: theme.text }]}>
                  {plan.name}
                </Text>
                <Text style={[styles.planPrice, { color: theme.primary }]}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}/month`}
                </Text>
              </View>
              {profile?.subscription_tier === plan.tier && (
                <View style={[styles.activeBadge, { backgroundColor: theme.success }]}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>
            <Text style={[styles.planCoins, { color: theme.textSecondary }]}>
              {plan.coins} coins/month
            </Text>
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <Text key={index} style={[styles.planFeature, { color: theme.textSecondary }]}>
                  • {feature}
                </Text>
              ))}
            </View>
            {profile?.subscription_tier !== plan.tier && plan.tier !== 'free' && (
              <Button
                title="Upgrade"
                onPress={() => handleUpgrade(plan.tier)}
                size="small"
                style={styles.upgradeButton}
              />
            )}
          </Card>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Settings
        </Text>
        <Card>
          <TouchableOpacity
            style={styles.settingItem}
            onPress={toggleTheme}
          >
            <View style={styles.settingLeft}>
              {themeMode === 'dark' ? (
                <Moon size={20} color={theme.text} />
              ) : (
                <Sun size={20} color={theme.text} />
              )}
              <Text style={[styles.settingText, { color: theme.text }]}>
                Theme
              </Text>
            </View>
            <Text style={[styles.settingValue, { color: theme.textSecondary }]}>
              {themeMode === 'dark' ? 'Dark' : 'Light'}
            </Text>
          </TouchableOpacity>
        </Card>
      </View>

      <Button
        title="Sign Out"
        onPress={handleSignOut}
        variant="outline"
        style={styles.signOutButton}
      />

      <Text style={[styles.version, { color: theme.textSecondary }]}>
        Velora v1.0.0
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  profileCard: {
    alignItems: 'center',
    margin: 16,
    padding: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    marginBottom: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  coinCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  coinInfo: {
    flex: 1,
  },
  coinBalance: {
    fontSize: 32,
    fontWeight: '700',
  },
  coinLabel: {
    fontSize: 14,
  },
  planCard: {
    marginBottom: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planCoins: {
    fontSize: 14,
    marginBottom: 12,
  },
  planFeatures: {
    marginBottom: 16,
  },
  planFeature: {
    fontSize: 14,
    marginBottom: 4,
  },
  upgradeButton: {
    marginTop: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingText: {
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  signOutButton: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 24,
  },
});
