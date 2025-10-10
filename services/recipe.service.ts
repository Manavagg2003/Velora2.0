import { supabase } from '@/lib/supabase';
import { RecipeData, RecipeCache, SavedRecipe } from '@/types/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_RECIPES_KEY = '@velora_offline_recipes';
const OFFLINE_FAVORITES_KEY = '@velora_offline_favorites';

export class RecipeService {
  private async getOfflineRecipes(): Promise<RecipeCache[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_RECIPES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading offline recipes:', error);
      return [];
    }
  }

  private async saveOfflineRecipes(recipes: RecipeCache[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_RECIPES_KEY, JSON.stringify(recipes));
    } catch (error) {
      console.error('Error saving offline recipes:', error);
    }
  }

  private async getOfflineFavorites(): Promise<SavedRecipe[]> {
    try {
      const data = await AsyncStorage.getItem(OFFLINE_FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading offline favorites:', error);
      return [];
    }
  }

  private async saveOfflineFavorites(favorites: SavedRecipe[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_FAVORITES_KEY, JSON.stringify(favorites));
    } catch (error) {
      console.error('Error saving offline favorites:', error);
    }
  }
  async saveRecipe(userId: string, recipeData: RecipeData, searchQuery?: string, isGenerated: boolean = false): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('recipe_cache')
        .insert({
          user_id: userId,
          recipe_data: recipeData,
          search_query: searchQuery,
          is_generated: isGenerated,
          cuisine_type: recipeData.cuisine_type,
          difficulty_level: recipeData.difficulty_level,
          cooking_time_minutes: recipeData.cooking_time_minutes,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error saving recipe:', error);
      return null;
    }
  }

  async getRecipes(userId: string, limit: number = 20): Promise<RecipeCache[]> {
    try {
      const { data, error } = await supabase
        .from('recipe_cache')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      if (data && data.length > 0) {
        await this.saveOfflineRecipes(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching recipes, using offline cache:', error);
      return await this.getOfflineRecipes();
    }
  }

  async searchRecipes(userId: string, filters: {
    query?: string;
    cuisine?: string;
    difficulty?: string;
    maxTime?: number;
  }): Promise<RecipeCache[]> {
    try {
      let query = supabase
        .from('recipe_cache')
        .select('*')
        .eq('user_id', userId);

      if (filters.cuisine) {
        query = query.eq('cuisine_type', filters.cuisine);
      }

      if (filters.difficulty) {
        query = query.eq('difficulty_level', filters.difficulty);
      }

      if (filters.maxTime) {
        query = query.lte('cooking_time_minutes', filters.maxTime);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching recipes:', error);
      return [];
    }
  }

  async saveToFavorites(userId: string, recipeId: string, rating?: number, notes?: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .insert({
          user_id: userId,
          recipe_id: recipeId,
          rating,
          notes,
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error saving to favorites:', error);
      return false;
    }
  }

  async removeFromFavorites(userId: string, recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .delete()
        .eq('user_id', userId)
        .eq('recipe_id', recipeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }

  async getFavorites(userId: string): Promise<SavedRecipe[]> {
    try {
      const { data, error } = await supabase
        .from('saved_recipes')
        .select(`
          *,
          recipe_cache (*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data && data.length > 0) {
        await this.saveOfflineFavorites(data);
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching favorites, using offline cache:', error);
      return await this.getOfflineFavorites();
    }
  }

  async updateRecipeRating(savedRecipeId: string, rating: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('saved_recipes')
        .update({ rating })
        .eq('id', savedRecipeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating rating:', error);
      return false;
    }
  }

  async deleteRecipe(recipeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('recipe_cache')
        .delete()
        .eq('id', recipeId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      return false;
    }
  }
async getRecipeById(recipeId: string): Promise<Recipe | null> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', recipeId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching recipe by id:', error);
      return null;
    }
  }

  async getFeaturedRecipes(limit: number = 5): Promise<Recipe[]> {
    try {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching featured recipes:', error);
      return [];
    }
  }

  async getUserStats(userId: string): Promise<{ recipesSaved: number; timeCooked: number; skillsLearned: number }> {
    try {
      const { data: savedRecipes, error: savedError } = await supabase
        .from('saved_recipes')
        .select('id')
        .eq('user_id', userId);

      if (savedError) throw savedError;

      // Mocked data for now
      const timeCooked = 45;
      const skillsLearned = 8;

      return {
        recipesSaved: savedRecipes?.length || 0,
        timeCooked,
        skillsLearned,
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        recipesSaved: 0,
        timeCooked: 0,
        skillsLearned: 0,
      };
    }
  }
}

export const recipeService = new RecipeService();
