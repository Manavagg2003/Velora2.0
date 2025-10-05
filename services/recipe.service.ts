import { supabase } from '@/lib/supabase';
import { RecipeData, RecipeCache, SavedRecipe } from '@/types/database';

export class RecipeService {
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
      return data || [];
    } catch (error) {
      console.error('Error fetching recipes:', error);
      return [];
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
      return data || [];
    } catch (error) {
      console.error('Error fetching favorites:', error);
      return [];
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
}

export const recipeService = new RecipeService();
