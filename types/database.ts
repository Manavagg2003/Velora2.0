export type SubscriptionTier = 'free' | 'plus' | 'pro' | 'ultra';
export type TransactionType = 'earned' | 'spent' | 'subscription' | 'bonus';
export type CookingSkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  coin_balance: number;
  subscription_tier: SubscriptionTier;
  subscription_start_date?: string;
  subscription_end_date?: string;
  razorpay_customer_id?: string;
  razorpay_subscription_id?: string;
  created_at: string;
  updated_at: string;
}

export interface RecipeData {
  id?: string;
  title: string;
  description: string;
  image_url?: string;
  cuisine_type: string;
  difficulty_level: 'easy' | 'medium' | 'hard';
  cooking_time_minutes: number;
  servings: number;
  ingredients: Array<{
    item: string;
    amount: string;
  }>;
  instructions: string[];
  nutrition?: {
    calories: number;
    protein: string;
    carbs: string;
    fat: string;
  };
  tags?: string[];
  rating?: number;
}

export interface RecipeCache {
  id: string;
  user_id: string;
  recipe_data: RecipeData;
  search_query?: string;
  is_generated: boolean;
  cuisine_type?: string;
  difficulty_level?: string;
  cooking_time_minutes?: number;
  created_at: string;
}

export interface SavedRecipe {
  id: string;
  user_id: string;
  recipe_id: string;
  notes?: string;
  rating?: number;
  created_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatConversation {
  id: string;
  user_id: string;
  title: string;
  messages: ChatMessage[];
  total_coins_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CoinTransaction {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: TransactionType;
  description: string;
  related_entity_id?: string;
  created_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  dietary_restrictions: string[];
  allergies: string[];
  cooking_skill_level: CookingSkillLevel;
  preferred_cuisines: string[];
  theme: ThemeMode;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface SubscriptionPlan {
  tier: SubscriptionTier;
  name: string;
  price: number;
  coins: number;
  features: string[];
  razorpay_plan_id?: string;
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    coins: 10,
    features: ['10 coins/month', 'Basic recipe search', 'Limited AI chat'],
  },
  {
    tier: 'plus',
    name: 'Plus',
    price: 4.99,
    coins: 50,
    features: ['50 coins/month', 'Advanced search', 'AI recipe generation', 'Save favorites'],
  },
  {
    tier: 'pro',
    name: 'Pro',
    price: 9.99,
    coins: 150,
    features: ['150 coins/month', 'Unlimited search', 'Priority AI responses', 'Meal planning'],
  },
  {
    tier: 'ultra',
    name: 'Ultra',
    price: 19.99,
    coins: 500,
    features: ['500 coins/month', 'All Pro features', 'Custom AI training', 'Nutrition tracking'],
  },
];
