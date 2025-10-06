import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { ChefHat } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';

export default function LoginScreen() {
  const { theme } = useTheme();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        Alert.alert('Error', 'Please enter your full name');
        return false;
      }

      if (password !== confirmPassword) {
        Alert.alert('Error', 'Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          Alert.alert('Sign Up Error', error.message || 'Failed to create account');
        } else {
          Alert.alert(
            'Success',
            'Account created successfully! You can now sign in.',
            [{ text: 'OK', onPress: () => setIsSignUp(false) }]
          );
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setFullName('');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          Alert.alert('Sign In Error', error.message || 'Invalid email or password');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setFullName('');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.header}>
        <View style={[styles.logoContainer, { backgroundColor: theme.primary }]}>
          <ChefHat size={40} color="#FFFFFF" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isSignUp
            ? 'Join Velora and start cooking with AI'
            : 'Sign in to your Velora account'}
        </Text>
      </View>

      <View style={styles.form}>
        {isSignUp && (
          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
            autoCorrect={false}
          />
        )}

        <Input
          label="Email Address"
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        {isSignUp && (
          <Input
            label="Confirm Password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />
        )}

        <Button
          title={isSignUp ? 'Sign Up' : 'Sign In'}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />

        <TouchableOpacity onPress={toggleMode} style={styles.toggleContainer}>
          <Text style={[styles.toggleText, { color: theme.textSecondary }]}>
            {isSignUp ? 'Already have an account? ' : "Don't have an account? "}
          </Text>
          <Text style={[styles.toggleLink, { color: theme.primary }]}>
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </Text>
        </TouchableOpacity>
      </View>

      {!isSignUp && (
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
      )}
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
  submitButton: {
    marginTop: 8,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  toggleText: {
    fontSize: 15,
  },
  toggleLink: {
    fontSize: 15,
    fontWeight: '700',
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
});
