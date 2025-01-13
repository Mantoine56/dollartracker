import React, { createContext } from 'react';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

interface SupabaseContextType {
  supabase: SupabaseClient;
}

export const SupabaseContext = createContext<SupabaseContextType | null>(null);

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const supabase = createClient(
    Constants.expoConfig?.extra?.supabaseUrl || '',
    Constants.expoConfig?.extra?.supabaseAnonKey || ''
  );

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
