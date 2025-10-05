import { supabase } from '@/lib/supabase';
import { ChatConversation, ChatMessage } from '@/types/database';

export class ChatService {
  async createConversation(userId: string, title: string = 'New Conversation'): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .insert({
          user_id: userId,
          title,
          messages: [],
          total_coins_spent: 0,
        })
        .select()
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async getConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getConversation(conversationId: string): Promise<ChatConversation | null> {
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('*')
        .eq('id', conversationId)
        .maybeSingle();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching conversation:', error);
      return null;
    }
  }

  async addMessage(conversationId: string, message: ChatMessage, coinCost: number): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return false;

      const updatedMessages = [...conversation.messages, message];
      const updatedCoinsSpent = conversation.total_coins_spent + coinCost;

      const { error } = await supabase
        .from('chat_conversations')
        .update({
          messages: updatedMessages,
          total_coins_spent: updatedCoinsSpent,
        })
        .eq('id', conversationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error adding message:', error);
      return false;
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating conversation title:', error);
      return false;
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('chat_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  generateConversationTitle(firstMessage: string): string {
    const maxLength = 40;
    if (firstMessage.length <= maxLength) {
      return firstMessage;
    }
    return firstMessage.substring(0, maxLength) + '...';
  }
}

export const chatService = new ChatService();
