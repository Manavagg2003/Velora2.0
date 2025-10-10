import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { CoinTransaction } from '@/types/database';

import { useAuth } from './AuthContext';

interface CoinContextType {
  balance: number;
  transactions: CoinTransaction[];
  loading: boolean;
  spendCoins: (amount: number, description: string, type?: string) => Promise<{ success: boolean; error?: string }>;
  grantCoins: (amount: number, description: string, type?: string) => Promise<{ success: boolean; error?: string }>;
  refreshBalance: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const CoinContext = createContext<CoinContextType | undefined>(undefined);

export function CoinProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<CoinTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBalance = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('coin_balance')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return;
      }

      setBalance(data?.coin_balance || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching transactions:', error);
        return;
      }

      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const refreshBalance = async () => {
    await fetchBalance();
  };

  const refreshTransactions = async () => {
    await fetchTransactions();
  };

  const spendCoins = async (amount: number, description: string, type: string = 'spent') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.rpc('charge_user_coins', {
        p_user_id: user.id,
        p_amount: amount,
        p_type: type,
        p_description: description
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh balance and transactions
      await Promise.all([fetchBalance(), fetchTransactions()]);
      
      return { success: true };
    } catch (error) {
      console.error('Error spending coins:', error);
      return { success: false, error: 'Failed to spend coins' };
    } finally {
      setLoading(false);
    }
  };

  const grantCoins = async (amount: number, description: string, type: string = 'earned') => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const { error } = await supabase.rpc('grant_user_coins', {
        p_user_id: user.id,
        p_amount: amount,
        p_type: type,
        p_description: description
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // Refresh balance and transactions
      await Promise.all([fetchBalance(), fetchTransactions()]);
      
      return { success: true };
    } catch (error) {
      console.error('Error granting coins:', error);
      return { success: false, error: 'Failed to grant coins' };
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user]);

  return (
    <CoinContext.Provider value={{
      balance,
      transactions,
      loading,
      spendCoins,
      grantCoins,
      refreshBalance,
      refreshTransactions
    }}>
      {children}
    </CoinContext.Provider>
  );
}

export function useCoins() {
  const context = useContext(CoinContext);
  if (context === undefined) {
    throw new Error('useCoins must be used within a CoinProvider');
  }
  return context;
}
