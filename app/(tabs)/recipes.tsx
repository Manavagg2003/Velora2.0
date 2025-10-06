import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Search, Plus, ListFilter as Filter, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { RecipeCard } from '@/components/RecipeCard';
import { CoinBalance } from '@/components/CoinBalance';
import { aiService } from '@/services/ai.service';
import { recipeService } from '@/services/recipe.service';
import { RecipeCache } from '@/types/database';
import { router } from 'expo-router';

const RECIPE_GENERATION_COST = 3;

export default function RecipesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile, spendCoins, refreshProfile } = useProfile();
  const [recipes, setRecipes] = useState<RecipeCache[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await recipeService.getRecipes(user.id);
      setRecipes(data);
    } catch (error) {
      console.error('Error loading recipes:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateRecipe = async () => {
    if (!user || !profile) return;

    if (profile.coin_balance < RECIPE_GENERATION_COST) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${RECIPE_GENERATION_COST} coins to generate a recipe. Please upgrade your subscription.`,
        [{ text: 'OK' }]
      );
      return;
    }

    setGenerating(true);

    try {
      const canSpend = await spendCoins(RECIPE_GENERATION_COST, 'AI Recipe Generation');

      if (!canSpend) {
        Alert.alert('Error', 'Failed to process coins. Please try again.');
        setGenerating(false);
        return;
      }

      const ingredients = searchQuery.split(',').map(i => i.trim()).filter(i => i);

      const recipeData = await aiService.generateRecipe({
        ingredients: ingredients.length > 0 ? ingredients : undefined,
        servings: 4,
      });

      const recipeId = await recipeService.saveRecipe(
        user.id,
        recipeData,
        searchQuery || 'AI Generated',
        true
      );

      if (recipeId) {
        Alert.alert('Success', 'Recipe generated successfully!');
        await loadRecipes();
        setSearchQuery('');
      }

      await refreshProfile();
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Error', 'Failed to generate recipe. Your coins have been refunded.');
    } finally {
      setGenerating(false);
    }
  };

  const searchRecipes = async () => {
    if (!user || !searchQuery.trim()) return;

    setLoading(true);
    try {
      const data = await recipeService.searchRecipes(user.id, {
        query: searchQuery,
      });
      setRecipes(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Recipes
        </Text>
        <CoinBalance />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Input
            placeholder="Search or enter ingredients..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            containerStyle={styles.searchInput}
          />
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: theme.primary }]}
            onPress={searchRecipes}
          >
            <Search size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <Button
          title={`Generate Recipe (${RECIPE_GENERATION_COST} coins)`}
          onPress={generateRecipe}
          loading={generating}
          variant="secondary"
          style={styles.generateButton}
        />
      </View>

      <ScrollView
        style={styles.recipesContainer}
        contentContainerStyle={styles.recipesContent}
      >
        {loading && !generating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <Sparkles size={48} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Recipes Yet
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              Generate your first AI-powered recipe or search for existing ones
            </Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe.recipe_data}
              onPress={() => {}}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  searchSection: {
    padding: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 8,
  },
  searchButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  generateButton: {
    width: '100%',
  },
  recipesContainer: {
    flex: 1,
  },
  recipesContent: {
    padding: 16,
    gap: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
  },
});
