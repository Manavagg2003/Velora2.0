import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Clock, ChefHat, Star } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { RecipeData } from '@/types/database';
import { Card } from './Card';

interface RecipeCardProps {
  recipe: RecipeData;
  onPress: () => void;
}

export function RecipeCard({ recipe, onPress }: RecipeCardProps) {
  const { theme } = useTheme();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return theme.success;
      case 'medium': return theme.warning;
      case 'hard': return theme.error;
      default: return theme.textSecondary;
    }
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card style={styles.card}>
        {recipe.image_url && (
          <Image source={{ uri: recipe.image_url }} style={styles.image} />
        )}
        <View style={styles.content}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>
            {recipe.title}
          </Text>
          <Text style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
            {recipe.description}
          </Text>

          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.textSecondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {recipe.cooking_time_minutes} min
              </Text>
            </View>

            <View style={styles.metaItem}>
              <ChefHat size={16} color={getDifficultyColor(recipe.difficulty_level)} />
              <Text style={[styles.metaText, { color: getDifficultyColor(recipe.difficulty_level) }]}>
                {recipe.difficulty_level}
              </Text>
            </View>

            {recipe.rating && recipe.rating > 0 && (
              <View style={styles.metaItem}>
                <Star size={16} color={theme.warning} />
                <Text style={[styles.metaText, { color: theme.text }]}>
                  {recipe.rating.toFixed(1)}
                </Text>
              </View>
            )}
          </View>

          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tags}>
              {recipe.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={[styles.tag, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.tagText, { color: theme.textSecondary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 0,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
  },
});
