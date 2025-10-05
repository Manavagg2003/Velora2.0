import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Sparkles, TrendingUp, Clock, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { CoinBalance } from '@/components/CoinBalance';
import { router } from 'expo-router';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { profile } = useProfile();

  const quickActions = [
    {
      id: 'generate',
      title: 'Generate Recipe',
      description: 'AI-powered recipe creation',
      icon: Sparkles,
      color: theme.primary,
      coins: 3,
      action: () => router.push('/recipes'),
    },
    {
      id: 'chat',
      title: 'Ask AI Chef',
      description: 'Get cooking advice',
      icon: Star,
      color: theme.secondary,
      coins: 1,
      action: () => router.push('/chat'),
    },
  ];

  const featuredCategories = [
    { id: 1, name: 'Quick Meals', image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400', time: '< 30 min' },
    { id: 2, name: 'Healthy', image: 'https://images.pexels.com/photos/1640770/pexels-photo-1640770.jpeg?auto=compress&cs=tinysrgb&w=400', time: 'Low cal' },
    { id: 3, name: 'Comfort Food', image: 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=400', time: 'Classic' },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Welcome back!
          </Text>
          <Text style={[styles.name, { color: theme.text }]}>
            {profile?.full_name || 'Chef'}
          </Text>
        </View>
        <CoinBalance />
      </View>

      <Card style={styles.welcomeCard}>
        <View style={styles.welcomeContent}>
          <Text style={[styles.welcomeTitle, { color: theme.text }]}>
            Ready to Cook Something Amazing?
          </Text>
          <Text style={[styles.welcomeText, { color: theme.textSecondary }]}>
            Let our AI help you discover new recipes or answer your cooking questions
          </Text>
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={action.action}
              activeOpacity={0.7}
              style={styles.actionItem}
            >
              <Card style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                  <action.icon size={24} color={action.color} />
                </View>
                <Text style={[styles.actionTitle, { color: theme.text }]}>
                  {action.title}
                </Text>
                <Text style={[styles.actionDescription, { color: theme.textSecondary }]}>
                  {action.description}
                </Text>
                <View style={styles.actionFooter}>
                  <Text style={[styles.coinCost, { color: theme.secondary }]}>
                    {action.coins} coins
                  </Text>
                </View>
              </Card>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Browse Categories
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
          {featuredCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              activeOpacity={0.8}
              style={styles.categoryCard}
            >
              <Image source={{ uri: category.image }} style={styles.categoryImage} />
              <View style={styles.categoryOverlay}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryTime}>{category.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Your Subscription
          </Text>
        </View>
        <Card>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionInfo}>
              <Text style={[styles.subscriptionTier, { color: theme.primary }]}>
                {profile?.subscription_tier?.toUpperCase() || 'FREE'}
              </Text>
              <Text style={[styles.subscriptionCoins, { color: theme.text }]}>
                {profile?.coin_balance || 0} coins remaining
              </Text>
            </View>
            <Button
              title="Upgrade"
              variant="outline"
              size="small"
              onPress={() => router.push('/profile')}
            />
          </View>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  welcomeCard: {
    marginBottom: 24,
    backgroundColor: '#FF6B35',
  },
  welcomeContent: {
    padding: 8,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
    color: '#FFFFFF',
  },
  welcomeText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#FFFFFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionItem: {
    flex: 1,
  },
  actionCard: {
    alignItems: 'center',
    padding: 20,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
  },
  actionFooter: {
    marginTop: 8,
  },
  coinCost: {
    fontSize: 14,
    fontWeight: '600',
  },
  categories: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  categoryCard: {
    width: 160,
    height: 120,
    marginRight: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  categoryName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  categoryTime: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  subscriptionCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionTier: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  subscriptionCoins: {
    fontSize: 14,
  },
});
