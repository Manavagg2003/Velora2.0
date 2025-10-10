import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Search, ListFilter as Filter } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { RecipeCard } from '@/components/RecipeCard';
import { CoinBalance } from '@/components/CoinBalance';

import { recipeService } from '@/services/recipe.service';
import { RecipeCache } from '@/types/database';
import { router } from 'expo-router';



export default function RecipesScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { balance, spendCoins, refreshBalance } = useCoins();
  const [recipes, setRecipes] = useState<RecipeCache[]>([]);
  const [loading, setLoading] = useState(false);


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
            placeholder="Search your recipes..."
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
          title="Generate a New Recipe"
          onPress={() => router.push('/(tabs)/generate-recipe')}
          icon={<Plus size={20} color="#FFFFFF" />}
          style={styles.generateButton}
        />
      </View>

      <ScrollView
        style={styles.recipesContainer}
        contentContainerStyle={styles.recipesContent}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
          </View>
        ) : recipes.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surface }]}>
              <Search size={48} color={theme.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>
              No Recipes Found
            </Text>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              You haven't saved any recipes yet. Try generating a new one!
            </Text>
          </View>
        ) : (
          recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe.recipe_data}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
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
