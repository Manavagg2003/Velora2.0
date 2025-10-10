import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Sparkles, 
  Clock, 
  Users, 
  ChefHat, 
  Heart, 
  Zap,
  Star,
  Timer,
  TrendingUp
} from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/contexts/ProfileContext';
import { useCoins } from '@/contexts/CoinContext';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { aiService } from '@/services/ai.service';
import { recipeService } from '@/services/recipe.service';
import { RecipeData } from '@/types/database';

const { width } = Dimensions.get('window');

const RECIPE_GENERATION_COST = 3;

export default function GenerateRecipeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { balance, spendCoins } = useCoins();
  const [ingredients, setIngredients] = useState('');
  const [constraints, setConstraints] = useState({
    cuisine: '',
    diet: '',
    time: '',
    difficulty: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedRecipe, setGeneratedRecipe] = useState<RecipeData | null>(null);

  const cuisineOptions = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'Indian', 'American', 'French', 'Thai'];
  const dietOptions = ['Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'High-Protein'];
  const difficultyOptions = ['Easy', 'Medium', 'Hard'];
  const timeOptions = ['15 min', '30 min', '45 min', '1 hour', '1.5 hours', '2+ hours'];

  const handleGenerateRecipe = async () => {
    if (!ingredients.trim()) {
      Alert.alert('Error', 'Please enter at least one ingredient');
      return;
    }

    if (balance < RECIPE_GENERATION_COST) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${RECIPE_GENERATION_COST} coins to generate a recipe. Please purchase more coins or wait for your monthly allocation.`
      );
      return;
    }

    setIsGenerating(true);
    setGeneratedRecipe(null);

    try {
      const ingredientList = ingredients
        .split(',')
        .map(ing => ing.trim())
        .filter(ing => ing.length > 0);

      const { success } = await spendCoins(
        RECIPE_GENERATION_COST,
        `Generated recipe from: ${ingredientList.join(', ')}`,
        'recipe_generation'
      );

      if (!success) {
        Alert.alert('Error', 'Failed to process coins. Please try again.');
        setIsGenerating(false);
        return;
      }

      const response = await aiService.generateRecipe({
        ingredients: ingredientList,
        constraints: {
          cuisine: constraints.cuisine || undefined,
          diet: constraints.diet || undefined,
          time: constraints.time ? parseInt(constraints.time) : undefined,
          difficulty: constraints.difficulty || undefined,
        },
        context: {
          dietaryRestrictions: profile?.dietary_restrictions || [],
          allergies: profile?.allergies || [],
          skillLevel: profile?.cooking_skill_level || 'intermediate',
          preferredCuisines: profile?.preferred_cuisines || [],
        },
      });

      if (response.recipe) {
        setGeneratedRecipe(response.recipe);
        
        // Save the generated recipe to cache
        if (user) {
          await recipeService.saveRecipe(
            user.id,
            response.recipe,
            `Generated from: ${ingredientList.join(', ')}`,
            true
          );
        }
      } else {
        Alert.alert('Error', 'Failed to generate recipe. Please try again.');
      }
    } catch (error) {
      console.error('Recipe generation error:', error);
      Alert.alert('Error', 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!generatedRecipe || !user) return;

    try {
      const success = await recipeService.saveToFavorites(
        user.id,
        generatedRecipe.id || '',
        5, // Default rating
        'Generated recipe'
      );

      if (success) {
        Alert.alert('Success', 'Recipe saved to your favorites!');
      } else {
        Alert.alert('Error', 'Failed to save recipe');
      }
    } catch (error) {
      console.error('Save recipe error:', error);
      Alert.alert('Error', 'Failed to save recipe');
    }
  };

  const OptionSelector = ({ 
    title, 
    options, 
    selected, 
    onSelect 
  }: { 
    title: string; 
    options: string[]; 
    selected: string; 
    onSelect: (value: string) => void; 
  }) => (
    <View style={styles.optionGroup}>
      <Text style={[styles.optionTitle, { color: theme.text }]}>{title}</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option)}
            style={[
              styles.optionButton,
              { 
                backgroundColor: selected === option ? theme.primary : theme.surfaceSecondary,
                borderColor: selected === option ? theme.primary : theme.border,
              }
            ]}
          >
            <Text style={[
              styles.optionText,
              { 
                color: selected === option ? theme.textInverse : theme.text 
              }
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderGeneratedRecipe = () => {
    if (!generatedRecipe) return null;

    return (
      <Card variant="elevated" style={styles.recipeCard}>
        <CardHeader>
          <View style={styles.recipeHeader}>
            <View style={styles.recipeTitleContainer}>
              <Text style={[styles.recipeTitle, { color: theme.text }]}>
                {generatedRecipe.title}
              </Text>
              <View style={styles.recipeBadges}>
                <Badge variant="gradient" size="sm">
                  {generatedRecipe.cuisine || 'International'}
                </Badge>
                <Badge variant="secondary" size="sm">
                  {generatedRecipe.difficulty}
                </Badge>
              </View>
            </View>
            <Button
              title=""
              onPress={handleSaveRecipe}
              variant="outline"
              size="sm"
              icon={<Heart size={16} color={theme.primary} />}
              style={styles.saveButton}
            />
          </View>
        </CardHeader>

        <CardContent>
          <Text style={[styles.recipeDescription, { color: theme.textSecondary }]}>
            {generatedRecipe.description}
          </Text>

          <View style={styles.recipeMeta}>
            <View style={styles.metaItem}>
              <Clock size={16} color={theme.primary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {generatedRecipe.prep_time + generatedRecipe.cook_time} min
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Users size={16} color={theme.secondary} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {generatedRecipe.servings} servings
              </Text>
            </View>
            <View style={styles.metaItem}>
              <TrendingUp size={16} color={theme.accent} />
              <Text style={[styles.metaText, { color: theme.textSecondary }]}>
                {generatedRecipe.difficulty}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Ingredients</Text>
            <View style={styles.ingredientsGrid}>
              {generatedRecipe.ingredients.map((ingredient, index) => (
                <Card key={index} variant="outlined" style={styles.ingredientCard}>
                  <View style={styles.ingredientItem}>
                    <Text style={[styles.ingredientAmount, { color: theme.primary }]}>
                      {ingredient.amount}
                    </Text>
                    <Text style={[styles.ingredientName, { color: theme.text }]}>
                      {ingredient.item}
                    </Text>
                  </View>
                </Card>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Instructions</Text>
            {generatedRecipe.instructions.map((instruction, index) => (
              <Card key={index} variant="outlined" style={styles.instructionCard}>
                <View style={styles.instructionItem}>
                  <View style={[styles.stepNumber, { backgroundColor: theme.primary }]}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.instructionText, { color: theme.text }]}>
                    {instruction}
                  </Text>
                </View>
              </Card>
            ))}
          </View>

          {generatedRecipe.nutrition && (
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Nutrition</Text>
              <Card variant="gradient" style={styles.nutritionCard}>
                <LinearGradient
                  colors={[theme.primary + '10', theme.secondary + '10']}
                  style={styles.nutritionGradient}
                >
                  <View style={styles.nutritionGrid}>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: theme.primary }]}>
                        {generatedRecipe.nutrition.calories}
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>
                        Calories
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: theme.secondary }]}>
                        {generatedRecipe.nutrition.protein}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>
                        Protein
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: theme.accent }]}>
                        {generatedRecipe.nutrition.carbs}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>
                        Carbs
                      </Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={[styles.nutritionValue, { color: theme.warning }]}>
                        {generatedRecipe.nutrition.fat}g
                      </Text>
                      <Text style={[styles.nutritionLabel, { color: theme.textSecondary }]}>
                        Fat
                      </Text>
                    </View>
                  </View>
                </LinearGradient>
              </Card>
            </View>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.titleGradient}
            >
              <Sparkles size={24} color={theme.textInverse} />
            </LinearGradient>
            <View style={styles.titleTextContainer}>
              <Text style={[styles.title, { color: theme.text }]}>Generate Recipe</Text>
              <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
                Tell me what ingredients you have, and I'll create a recipe for you!
              </Text>
            </View>
          </View>
          <View style={styles.coinBalance}>
            <LinearGradient
              colors={[theme.primary, theme.secondary]}
              style={styles.coinBalanceGradient}
            >
              <Zap size={16} color={theme.textInverse} />
              <Text style={[styles.coinText, { color: theme.textInverse }]}>{balance}</Text>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Form */}
      <Card variant="elevated" style={styles.form}>
        <CardHeader>
          <Text style={[styles.formTitle, { color: theme.text }]}>Recipe Preferences</Text>
        </CardHeader>
        <CardContent>
          <Input
            label="Ingredients *"
            placeholder="Enter ingredients separated by commas (e.g., chicken, rice, vegetables)"
            value={ingredients}
            onChangeText={setIngredients}
            multiline
            numberOfLines={3}
            variant="filled"
          />

          <OptionSelector
            title="Cuisine Type"
            options={cuisineOptions}
            selected={constraints.cuisine}
            onSelect={(value) => setConstraints(prev => ({ ...prev, cuisine: value }))}
          />

          <OptionSelector
            title="Dietary Preferences"
            options={dietOptions}
            selected={constraints.diet}
            onSelect={(value) => setConstraints(prev => ({ ...prev, diet: value }))}
          />

          <View style={styles.constraintsRow}>
            <OptionSelector
              title="Cooking Time"
              options={timeOptions}
              selected={constraints.time}
              onSelect={(value) => setConstraints(prev => ({ ...prev, time: value }))}
            />
          </View>

          <OptionSelector
            title="Difficulty Level"
            options={difficultyOptions}
            selected={constraints.difficulty}
            onSelect={(value) => setConstraints(prev => ({ ...prev, difficulty: value }))}
          />

          <Button
            title={isGenerating ? "Generating Recipe..." : `Generate Recipe (${RECIPE_GENERATION_COST} coins)`}
            onPress={handleGenerateRecipe}
            disabled={isGenerating || balance < RECIPE_GENERATION_COST}
            loading={isGenerating}
            icon={<ChefHat size={20} color={theme.textInverse} />}
            fullWidth
            style={styles.generateButton}
          />

          <Text style={[styles.costInfo, { color: theme.textSecondary }]}>
            Recipe generation costs {RECIPE_GENERATION_COST} VeloraCoins
          </Text>
        </CardContent>
      </Card>

      {renderGeneratedRecipe()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 16,
  },
  titleGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  titleTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
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
  coinText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
  },
  form: {
    margin: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  optionGroup: {
    marginBottom: 20,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  optionsContainer: {
    paddingRight: 20,
  },
  optionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  constraintsRow: {
    marginBottom: 20,
  },
  generateButton: {
    marginTop: 8,
    marginBottom: 12,
  },
  costInfo: {
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '500',
  },
  recipeCard: {
    margin: 20,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recipeTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  recipeBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  recipeDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  ingredientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  ingredientCard: {
    padding: 8,
    minWidth: 120,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientAmount: {
    fontSize: 12,
    fontWeight: '600',
    width: 50,
  },
  ingredientName: {
    fontSize: 12,
    flex: 1,
  },
  instructionCard: {
    marginBottom: 8,
    padding: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  instructionText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  nutritionCard: {
    padding: 0,
  },
  nutritionGradient: {
    padding: 16,
    borderRadius: 16,
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 60,
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
