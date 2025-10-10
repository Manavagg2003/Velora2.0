import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { recipeService } from '@/services/recipe.service';
import { Recipe } from '@/types/database';
import { useTheme } from '@/contexts/ThemeContext';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const { theme } = useTheme();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchRecipe = async () => {
        try {
          const data = await recipeService.getRecipeById(id as string);
          setRecipe(data);
        } catch (error) {
          console.error('Error fetching recipe:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchRecipe();
    }
  }, [id]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center' }]}>
        <Text style={{ color: theme.text }}>Recipe not found.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <Image source={{ uri: recipe.image_url || 'https://placehold.co/600x400' }} style={styles.image} />
      <View style={styles.content}>
        <Text style={[styles.title, { color: theme.text }]}>{recipe.title}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>{recipe.description}</Text>

        <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
        {recipe.ingredients.map((ingredient, index) => (
          <Text key={index} style={[styles.ingredient, { color: theme.text }]}>
            {`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
          </Text>
        ))}

        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 20 }]}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <Text key={index} style={[styles.instruction, { color: theme.text }]}>
            {`${index + 1}. ${instruction}`}
          </Text>
        ))}
      </View>
    </ScrollView>
  );

  const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: 250,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  ingredient: {
    fontSize: 16,
    marginBottom: 5,
  },
  instruction: {
    fontSize: 16,
    marginBottom: 15,
  },
});
}