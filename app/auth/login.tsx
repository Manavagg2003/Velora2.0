import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChefHat } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signInWithOTP } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const { error } = await signInWithOTP(email);

      if (error) {
        Alert.alert('Error', error.message || 'Failed to send login link');
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.successContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.success + '20' }]}>
            <ChefHat size={48} color={theme.success} />
          </View>
          <Text style={[styles.successTitle, { color: theme.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successText, { color: theme.textSecondary }]}>
            We've sent a magic link to
          </Text>
          <Text style={[styles.email, { color: theme.primary }]}>
            {email}
          </Text>
          <Text style={[styles.successText, { color: theme.textSecondary }]}>
            Click the link in the email to sign in to your Velora account.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => setEmailSent(false)}
            variant="outline"
            style={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
          <ChefHat size={40} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          Welcome to Velora
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your AI-powered cooking companion
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Button
          title="Send Magic Link"
          onPress={handleLogin}
          loading={loading}
          style={styles.loginButton}
        />

        <Text style={[styles.infoText, { color: theme.textSecondary }]}>
          We'll send you a secure login link via email. No password required!
        </Text>
      </View>

      <View style={styles.features}>
        <Text style={[styles.featuresTitle, { color: theme.text }]}>
          What you'll get:
        </Text>
        <View style={styles.featureItem}>
          <Text style={[styles.featureBullet, { color: theme.primary }]}>•</Text>
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            10 free VeloraCoins to start
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={[styles.featureBullet, { color: theme.primary }]}>•</Text>
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            AI-powered recipe generation
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={[styles.featureBullet, { color: theme.primary }]}>•</Text>
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Personalized cooking assistant
          </Text>
        </View>
        <View style={styles.featureItem}>
          <Text style={[styles.featureBullet, { color: theme.primary }]}>•</Text>
          <Text style={[styles.featureText, { color: theme.textSecondary }]}>
            Save and organize your favorites
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  loginButton: {
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  features: {
    marginTop: 24,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  featureBullet: {
    fontSize: 20,
    marginRight: 12,
    marginTop: -2,
  },
  featureText: {
    fontSize: 15,
    flex: 1,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
  },
  successText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
  },
  backButton: {
    marginTop: 24,
  },
});
