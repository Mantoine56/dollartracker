import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

// Constants for chunked storage
const CHUNK_SIZE = 1800; // Slightly less than 2048 to account for metadata
const CHUNK_PREFIX = 'CHUNK_';

// Enhanced secure store adapter that handles data chunking
const EnhancedSecureStoreAdapter = {
  getItem: async (key: string) => {
    try {
      // First try to get the value directly (for small items)
      const directValue = await SecureStore.getItemAsync(key);
      if (directValue && !directValue.startsWith(CHUNK_PREFIX)) {
        return directValue;
      }

      // If the value starts with CHUNK_PREFIX or doesn't exist, try to get chunks
      const numChunksStr = await SecureStore.getItemAsync(`${key}_chunks`);
      if (!numChunksStr) return null;

      const numChunks = parseInt(numChunksStr, 10);
      const chunks: string[] = [];

      for (let i = 0; i < numChunks; i++) {
        const chunk = await SecureStore.getItemAsync(`${key}_${i}`);
        if (chunk === null) return null; // If any chunk is missing, return null
        chunks.push(chunk);
      }

      return chunks.join('');
    } catch (error) {
      console.error('Error in getItem:', error);
      return null;
    }
  },

  setItem: async (key: string, value: string) => {
    try {
      // If the value is small enough, store it directly
      if (value.length < CHUNK_SIZE) {
        return SecureStore.setItemAsync(key, value);
      }

      // Split the value into chunks
      const chunks: string[] = [];
      for (let i = 0; i < value.length; i += CHUNK_SIZE) {
        chunks.push(value.slice(i, i + CHUNK_SIZE));
      }

      // Store the number of chunks
      await SecureStore.setItemAsync(`${key}_chunks`, chunks.length.toString());

      // Store each chunk
      await Promise.all(
        chunks.map((chunk, index) =>
          SecureStore.setItemAsync(`${key}_${index}`, chunk)
        )
      );

      // Store a marker in the original key to indicate it's chunked
      return SecureStore.setItemAsync(key, `${CHUNK_PREFIX}${chunks.length}`);
    } catch (error) {
      console.error('Error in setItem:', error);
      throw error;
    }
  },

  removeItem: async (key: string) => {
    try {
      // Try to get the value to check if it's chunked
      const value = await SecureStore.getItemAsync(key);
      if (value && value.startsWith(CHUNK_PREFIX)) {
        const numChunks = parseInt(value.replace(CHUNK_PREFIX, ''), 10);
        
        // Remove all chunks
        await Promise.all([
          SecureStore.deleteItemAsync(`${key}_chunks`),
          ...Array(numChunks)
            .fill(0)
            .map((_, i) => SecureStore.deleteItemAsync(`${key}_${i}`)),
        ]);
      }

      // Remove the main key
      return SecureStore.deleteItemAsync(key);
    } catch (error) {
      console.error('Error in removeItem:', error);
      throw error;
    }
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase URL or Anonymous Key');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? AsyncStorage : EnhancedSecureStoreAdapter,
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
