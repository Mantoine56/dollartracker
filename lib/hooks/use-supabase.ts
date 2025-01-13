import { createClient } from '@supabase/supabase-js';
import { useContext } from 'react';
import Constants from 'expo-constants';
import { SupabaseContext } from '../../context/supabase';

// Create a single supabase client for interacting with your database
const supabase = createClient(
  Constants.expoConfig?.extra?.supabaseUrl || '',
  Constants.expoConfig?.extra?.supabaseAnonKey || ''
);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) return supabase;
  return context.supabase;
}
