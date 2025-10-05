import { GoogleGenerativeAI } from '@google/generative-ai';
import { RecipeData } from '@/types/database';

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export class AIService {
  private model;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
  }

  async chatWithAI(message: string, conversationHistory: Array<{ role: string; content: string }> = []): Promise<string> {
    try {
      const context = `You are Velora, an expert AI cooking assistant. You help users with cooking questions,
      recipe advice, ingredient substitutions, cooking techniques, and culinary tips. Be friendly, helpful,
      and provide practical advice. Keep responses concise but informative.`;

      const formattedHistory = conversationHistory.map(msg =>
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

      const prompt = `${context}\n\nConversation history:\n${formattedHistory}\n\nUser: ${message}\n\nAssistant:`;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (error) {
      console.error('AI chat error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }

  async generateRecipe(params: {
    ingredients?: string[];
    cuisine?: string;
    dietaryRestrictions?: string[];
    skillLevel?: string;
    cookingTime?: number;
    servings?: number;
  }): Promise<RecipeData> {
    try {
      const prompt = this.buildRecipePrompt(params);

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return this.parseRecipeResponse(response);
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Failed to generate recipe. Please try again.');
    }
  }

  private buildRecipePrompt(params: any): string {
    let prompt = `Generate a detailed recipe in JSON format with the following structure:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "cuisine_type": "Cuisine",
  "difficulty_level": "easy|medium|hard",
  "cooking_time_minutes": number,
  "servings": number,
  "ingredients": [{"item": "ingredient name", "amount": "quantity"}],
  "instructions": ["step 1", "step 2", ...],
  "nutrition": {
    "calories": number,
    "protein": "Xg",
    "carbs": "Xg",
    "fat": "Xg"
  },
  "tags": ["tag1", "tag2"]
}

Requirements:
`;

    if (params.ingredients && params.ingredients.length > 0) {
      prompt += `- Must use these ingredients: ${params.ingredients.join(', ')}\n`;
    }
    if (params.cuisine) {
      prompt += `- Cuisine type: ${params.cuisine}\n`;
    }
    if (params.dietaryRestrictions && params.dietaryRestrictions.length > 0) {
      prompt += `- Dietary restrictions: ${params.dietaryRestrictions.join(', ')}\n`;
    }
    if (params.skillLevel) {
      prompt += `- Skill level: ${params.skillLevel}\n`;
    }
    if (params.cookingTime) {
      prompt += `- Maximum cooking time: ${params.cookingTime} minutes\n`;
    }
    if (params.servings) {
      prompt += `- Servings: ${params.servings}\n`;
    }

    prompt += `\nProvide ONLY the JSON object, no additional text.`;

    return prompt;
  }

  private parseRecipeResponse(response: string): RecipeData {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        title: parsed.title || 'Untitled Recipe',
        description: parsed.description || '',
        cuisine_type: parsed.cuisine_type || 'Other',
        difficulty_level: parsed.difficulty_level || 'medium',
        cooking_time_minutes: parsed.cooking_time_minutes || 30,
        servings: parsed.servings || 4,
        ingredients: parsed.ingredients || [],
        instructions: parsed.instructions || [],
        nutrition: parsed.nutrition,
        tags: parsed.tags || [],
        rating: 0,
      };
    } catch (error) {
      console.error('Failed to parse recipe:', error);
      throw new Error('Failed to parse recipe data');
    }
  }

  async getRecipeSuggestions(query: string): Promise<string[]> {
    try {
      const prompt = `Given the search query: "${query}", suggest 5 relevant recipe ideas.
      Return only a JSON array of recipe names, like: ["Recipe 1", "Recipe 2", ...]`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (error) {
      console.error('Recipe suggestions error:', error);
      return [];
    }
  }

  async analyzeIngredients(ingredients: string[]): Promise<{ compatible: boolean; suggestions: string[] }> {
    try {
      const prompt = `Analyze these ingredients for cooking compatibility: ${ingredients.join(', ')}
      Return JSON: {"compatible": true/false, "suggestions": ["suggestion 1", ...]}`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return { compatible: true, suggestions: [] };
    } catch (error) {
      console.error('Ingredient analysis error:', error);
      return { compatible: true, suggestions: [] };
    }
  }
}

export const aiService = new AIService();
