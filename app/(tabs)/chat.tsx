import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Send, Sparkles } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useCoins } from '@/contexts/CoinContext';
import { useAuth } from '@/contexts/AuthContext';
import { aiService } from '@/services/ai.service';
import { chatService } from '@/services/chat.service';
import { CoinBalance } from '@/components/CoinBalance';
import { ChatMessage } from '@/types/database';

const MESSAGE_COST = 1;

export default function ChatScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { balance, spendCoins, refreshBalance } = useCoins();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeConversation();
  }, []);

  const initializeConversation = async () => {
    if (!user) return;

    const id = await chatService.createConversation(user.id);
    setConversationId(id);

    const welcomeMessage: ChatMessage = {
      role: 'assistant',
      content: "Hi! I'm Velora, your AI cooking assistant. I can help you with recipes, cooking techniques, ingredient substitutions, and more. What would you like to know?",
      timestamp: new Date().toISOString(),
    };
    setMessages([welcomeMessage]);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading || !user || !conversationId) return;

    if (!balance || balance < MESSAGE_COST) {
      Alert.alert(
        'Insufficient Coins',
        `You need ${MESSAGE_COST} coin to send a message. Please upgrade your subscription to continue.`,
        [{ text: 'OK' }]
      );
      return;
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const { success } = await spendCoins(MESSAGE_COST, 'AI Chat Message', 'chat');

      if (!success) {
        Alert.alert('Error', 'Failed to process coins. Please try again.');
        setMessages(prev => prev.slice(0, -1));
        setLoading(false);
        return;
      }

      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const aiResponse = await aiService.chatWithAI(userMessage.content, conversationHistory);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      await chatService.addMessage(conversationId, userMessage, MESSAGE_COST);
      await chatService.addMessage(conversationId, assistantMessage, 0);

      if (messages.length === 1) {
        const title = chatService.generateConversationTitle(userMessage.content);
        await chatService.updateConversationTitle(conversationId, title);
      }

      await refreshBalance();
    } catch (error) {
      console.error('Chat error:', error);
      Alert.alert('Error', 'Failed to get AI response. Your coins have been refunded.');

      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.aiIcon, { backgroundColor: theme.primary + '20' }]}>
            <Sparkles size={24} color={theme.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              AI Cooking Assistant
            </Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Ask me anything about cooking
            </Text>
          </View>
        </View>
        <CoinBalance />
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
      >
        {messages.map((message, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              message.role === 'user' ? styles.userMessage : styles.assistantMessage,
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? { backgroundColor: theme.primary }
                  : { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border },
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  { color: message.role === 'user' ? '#FFFFFF' : theme.text },
                ]}
              >
                {message.content}
              </Text>
            </View>
          </View>
        ))}
        {loading && (
          <View style={[styles.messageContainer, styles.assistantMessage]}>
            <View style={[styles.messageBubble, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}>
              <Text style={[styles.messageText, { color: theme.textSecondary }]}>
                Thinking...
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={[styles.inputContainer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
        <View style={[styles.inputWrapper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Ask about cooking..."
            placeholderTextColor={theme.textSecondary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={sendMessage}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!input.trim() || loading}
            style={[
              styles.sendButton,
              { backgroundColor: theme.primary },
              (!input.trim() || loading) && { opacity: 0.5 },
            ]}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.costInfo, { color: theme.textSecondary }]}>
          {MESSAGE_COST} coin per message
        </Text>
      </View>
    </KeyboardAvoidingView>
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: 12,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userMessage: {
    alignSelf: 'flex-end',
  },
  assistantMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  costInfo: {
    fontSize: 12,
    textAlign: 'center',
  },
});
