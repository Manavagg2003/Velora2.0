import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://kebsnpfrzlsnnbweasnx.supabase.co';
const supabaseAnonKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtlYnNucGZyemxzbm5id2Vhc254Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkyODcwNTAsImV4cCI6MjA3NDg2MzA1MH0.mB6e8MkCW4ViponlAfvNv8LfsiSqt2f_dZuZNBJX4co';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Edge Function URLs
export const EDGE_FUNCTIONS = {
  GEMINI_PROXY: `${supabaseUrl}/functions/v1/gemini-proxy`,
  RAZORPAY_VERIFY: `${supabaseUrl}/functions/v1/razorpay-verify`,
  RAZORPAY_CREATE_ORDER: `${supabaseUrl}/functions/v1/razorpay-create-order`,
};
