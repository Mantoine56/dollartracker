import { createSafeContext } from './utils/create-safe-context';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';
import { useMemo } from 'react';

interface SupabaseContextValue {
  supabase: SupabaseClient;
  isReady: boolean;
}

const [SupabaseProvider, useSupabase] = createSafeContext<SupabaseContextValue>({
  name: 'Supabase',
  validateValue: (value) => !!value.supabase,
});

function SupabaseProviderComponent({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => 
    createClient(
      Constants.expoConfig?.extra?.supabaseUrl || '',
      Constants.expoConfig?.extra?.supabaseAnonKey || ''
    ),
    [] // Create once and never recreate
  );

  const value = useMemo(() => ({
    supabase,
    isReady: true,
  }), [supabase]);

  return <SupabaseProvider value={value}>{children}</SupabaseProvider>;
}

export { SupabaseProviderComponent as SupabaseProvider, useSupabase };
