import { supabase, EDGE_FUNCTIONS } from '@/lib/supabase';
import { ChatMessage, RecipeData } from '@/types/database';

export interface ChatRequest {
  message: string;
  conversationId?: string;
  context?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    skillLevel?: string;
    preferredCuisines?: string[];
  };
  type: 'chat' | 'recipe_generation';
  ingredients?: string[];
  constraints?: {
    cuisine?: string;
    diet?: string;
    time?: number;
    difficulty?: string;
  };
}

export interface ChatResponse {
  text: string;
  recipe?: RecipeData;
  conversationId?: string;
  tokens_used?: number;
}

export interface RecipeGenerationRequest {
  ingredients: string[];
  constraints?: {
    cuisine?: string;
    diet?: string;
    time?: number;
    difficulty?: string;
  };
  context?: {
    dietaryRestrictions?: string[];
    allergies?: string[];
    skillLevel?: string;
    preferredCuisines?: string[];
  };
}

class AIService {
  private async makeRequest(endpoint: string, data: any): Promise<any> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('No active session');
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('AI Service error:', error);
      throw error;
    }
  }

  async sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.makeRequest(EDGE_FUNCTIONS.GEMINI_PROXY, request);
      return response;
    } catch (error) {
      console.error('Chat message error:', error);
      throw new Error('Failed to send chat message');
    }
  }

  async generateRecipe(request: RecipeGenerationRequest): Promise<ChatResponse> {
    try {
      const response = await this.makeRequest(EDGE_FUNCTIONS.GEMINI_PROXY, {
        message: `Generate a recipe using these ingredients: ${request.ingredients.join(', ')}`,
        type: 'recipe_generation',
        ingredients: request.ingredients,
        constraints: request.constraints,
        context: request.context,
      });
      return response;
    } catch (error) {
      console.error('Recipe generation error:', error);
      throw new Error('Failed to generate recipe');
    }
  }

  async getConversations(): Promise<any[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Get conversations error:', error);
      throw new Error('Failed to fetch conversations');
    }
  }

  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data, error } = await supabase
        .from('chat_conversations')
        .select('messages')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data?.messages || [];
    } catch (error) {
      console.error('Get conversation messages error:', error);
      throw new Error('Failed to fetch conversation messages');
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw new Error('Failed to delete conversation');
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Update conversation title error:', error);
      throw new Error('Failed to update conversation title');
    }
  }
}

export const aiService = new AIService();