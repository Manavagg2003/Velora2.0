import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './AuthContext';
import { Profile, CoinTransaction, UserPreferences } from '@/types/database';

interface ProfileContextType {
  profile: Profile | null;
  preferences: UserPreferences | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  spendCoins: (amount: number, description: string, relatedId?: string) => Promise<boolean>;
  addCoins: (amount: number, description: string) => Promise<void>;
  getTransactions: () => Promise<CoinTransaction[]>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadPreferences();
    } else {
      setProfile(null);
      setPreferences(null);
      setLoading(false);
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setPreferences(data);
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;
      await refreshProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
      await loadPreferences();
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  const spendCoins = async (amount: number, description: string, relatedId?: string): Promise<boolean> => {
    if (!user || !profile) return false;

    if (profile.coin_balance < amount) {
      return false;
    }

    try {
      const newBalance = profile.coin_balance - amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coin_balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount: -amount,
          transaction_type: 'spent',
          description,
          related_entity_id: relatedId,
        });

      if (transactionError) throw transactionError;

      await refreshProfile();
      return true;
    } catch (error) {
      console.error('Error spending coins:', error);
      return false;
    }
  };

  const addCoins = async (amount: number, description: string) => {
    if (!user || !profile) return;

    try {
      const newBalance = profile.coin_balance + amount;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ coin_balance: newBalance })
        .eq('id', user.id);

      if (updateError) throw updateError;

      const { error: transactionError } = await supabase
        .from('coin_transactions')
        .insert({
          user_id: user.id,
          amount,
          transaction_type: 'earned',
          description,
        });

      if (transactionError) throw transactionError;

      await refreshProfile();
    } catch (error) {
      console.error('Error adding coins:', error);
      throw error;
    }
  };

  const getTransactions = async (): Promise<CoinTransaction[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error loading transactions:', error);
      return [];
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        preferences,
        loading,
        refreshProfile,
        updateProfile,
        updatePreferences,
        spendCoins,
        addCoins,
        getTransactions,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}
