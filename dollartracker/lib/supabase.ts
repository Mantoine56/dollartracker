import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// Implement a custom storage adapter for secure storage
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => {
    return SecureStore.getItemAsync(key);
  },
  setItem: (key: string, value: string) => {
    return SecureStore.setItemAsync(key, value);
  },
  removeItem: (key: string) => {
    return SecureStore.deleteItemAsync(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? AsyncStorage : ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    onAuthStateChange: (event, session) => {
      console.log('Supabase auth event:', event);
      if (session?.user) {
        console.log('User session:', session.user.email);
      }
    },
  },
});

// Handle deep linking for email confirmation
Linking.addEventListener('url', async ({ url }) => {
  if (url.includes('confirmation_token=')) {
    const token = url.split('confirmation_token=')[1]?.split('&')[0];
    if (token) {
      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        });
        if (error) throw error;
        console.log('Email confirmed successfully');
      } catch (error) {
        console.error('Error confirming email:', error);
      }
    }
  }
});
