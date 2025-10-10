import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions,
  RefreshControl 
} from 'react-native';
import { 
  Sparkles, 
  TrendingUp, 
  Clock, 
  Star, 
  ChefHat, 
  MessageCircle, 
  Heart,
  Zap,
  Users
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useCoins } from '@/contexts/CoinContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { router } from 'expo-router';

import { RecipeCard } from '@/components/RecipeCard';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { balance } = useCoins();
  const [refreshing, setRefreshing] = useState(false);
  const [featuredRecipes, setFeaturedRecipes] = useState([]);

  const [stats, setStats] = useState({ recipesSaved: 0, timeCooked: 0, skillsLearned: 0 });

  useEffect(() => {
    if (user) {
      loadFeaturedRecipes();
      loadUserStats();
    }
  }, [user]);

  const loadFeaturedRecipes = async () => {
    const data = await recipeService.getFeaturedRecipes();
    setFeaturedRecipes(data as any);
  };

  const loadUserStats = async () => {
    if (!user) return;
    const data = await recipeService.getUserStats(user.id);
    setStats(data);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFeaturedRecipes(), loadUserStats()]);
    setRefreshing(false);
  };

  const QuickAction = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    gradient,
    iconColor = theme.textInverse,
  }: {
    icon: any;
    title: string;
    subtitle: string;
    onPress: () => void;
    gradient: string[];
    iconColor?: string;
  }) => (
    <TouchableOpacity onPress={onPress} style={styles.quickActionContainer}>
      <LinearGradient
        colors={gradient}
        style={styles.quickAction}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.quickActionIcon}>
          <Icon size={28} color={iconColor} />
        </View>
        <Text style={[styles.quickActionTitle, { color: iconColor }]}>
          {title}
        </Text>
        <Text style={[styles.quickActionSubtitle, { color: iconColor + 'CC' }]}>
          {subtitle}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  

  const StatCard = ({ 
    icon: Icon, 
    value, 
    label, 
    color 
  }: { 
    icon: any; 
    value: string; 
    label: string; 
    color: string; 
  }) => (
    <Card variant="gradient" style={styles.statCard}>
      <LinearGradient
        colors={[color + '20', color + '10']}
        style={styles.statGradient}
      >
        <Icon size={24} color={color} />
        <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
        <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
      </LinearGradient>
    </Card>
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>
            Good morning,
          </Text>
          <Text style={[styles.name, { color: theme.text }]}>
            {profile?.full_name || 'Chef'} 👋
          </Text>
        </View>
        <View style={styles.coinBalance}>
          <LinearGradient
            colors={[theme.primary, theme.secondary]}
            style={styles.coinBalanceGradient}
          >
            <Zap size={16} color={theme.textInverse} />
            <Text style={[styles.coinBalanceText, { color: theme.textInverse }]}>
              {balance}
            </Text>
          </LinearGradient>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <QuickAction
            icon={Sparkles}
            title="Generate Recipe"
            subtitle="AI-powered recipes"
            onPress={() => router.push('/(tabs)/generate-recipe')}
            gradient={[theme.primary, theme.primaryDark]}
          />
          <QuickAction
            icon={MessageCircle}
            title="Ask AI"
            subtitle="Cooking questions"
            onPress={() => router.push('/(tabs)/chat')}
            gradient={[theme.secondary, theme.secondaryDark]}
          />
        </View>
      </View>

      {/* Featured Recipes */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Featured Recipes
          </Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/recipes')}>
            <Text style={[styles.seeAll, { color: theme.primary }]}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredRecipes.map((recipe: any) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
              style={styles.recipeCard}
            />
          ))}
        </ScrollView>
      </View>

      {/* Stats */}
      <View style={styles.statsSection}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Your Stats
        </Text>
        <View style={styles.statsGrid}>
          <StatCard
            icon={Heart}
            value={stats.recipesSaved.toString()}
            label="Recipes Saved"
            color={theme.primary}
          />
          <StatCard
            icon={Clock}
            value={`${stats.timeCooked}m`}
            label="Time Cooked"
            color={theme.secondary}
          />
          <StatCard
            icon={TrendingUp}
            value={stats.skillsLearned.toString()}
            label="Skills Learned"
            color={theme.accent}
          />
        </View>
      </View>

      {/* CTA Section */}
      <Card variant="gradient" style={styles.ctaCard}>
        <LinearGradient
          colors={[theme.primary, theme.secondary]}
          style={styles.ctaGradient}
        >
          <Text style={[styles.ctaTitle, { color: theme.textInverse }]}>
            Ready to cook something amazing?
          </Text>
          <Text style={[styles.ctaSubtitle, { color: theme.textInverse + 'CC' }]}>
            Let our AI help you create the perfect recipe
          </Text>
          <Button
            title="Start Cooking"
            onPress={() => router.push('/(tabs)/generate-recipe')}
            variant="outline"
            style={styles.ctaButton}
            textStyle={{ color: theme.textInverse }}
          />
        </LinearGradient>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    marginBottom: 4,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
  },
  coinBalance: {
    marginLeft: 16,
  },
  coinBalanceGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  coinBalanceText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActions: {
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  quickActionContainer: {
    flex: 1,
  },
  quickAction: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  quickActionIcon: {
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  featuredSection: {
    marginBottom: 32,
  },
  featuredScroll: {
    paddingRight: 20,
  },
  recipeCard: {
    width: width * 0.7,
    marginRight: 16,
  },
  recipeImageContainer: {
    position: 'relative',
    height: 120,
    marginBottom: 12,
  },
  recipeImagePlaceholder: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  recipeContent: {
    padding: 0,
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  recipeDescription: {
    fontSize: 14,
    marginBottom: 12,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  recipeMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recipeMetaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  recipeTags: {
    flexDirection: 'row',
    gap: 6,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 0,
  },
  statGradient: {
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaCard: {
    padding: 0,
  },
  ctaGradient: {
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
  },
  ctaButton: {
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
