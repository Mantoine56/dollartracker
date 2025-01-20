import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { Database } from './types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

// Enhanced secure store adapter with atomic operations and proper locking
class EnhancedSecureStoreAdapter {
  private locks: Map<string, Promise<void>> = new Map();

  private async withLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // Wait for any existing lock to be released
    const existingLock = this.locks.get(key);
    if (existingLock) {
      await existingLock;
    }

    // Create new lock
    let resolveLock!: () => void;
    const newLock = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.locks.set(key, newLock);

    try {
      return await operation();
    } finally {
      resolveLock();
      this.locks.delete(key);
    }
  }

  private async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delayMs: number = 100
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (i < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  async getItem(key: string): Promise<string | null> {
    return this.withLock(key, async () => {
      try {
        const value = await SecureStore.getItemAsync(key);
        if (process.env.NODE_ENV === 'development') {
          console.log(`SecureStore.getItem(${key}):`, value ? 'exists' : 'null');
        }
        return value;
      } catch (error) {
        console.error(`SecureStore getItem failed:`, error);
        return null;
      }
    });
  }

  async setItem(key: string, value: string): Promise<void> {
    return this.withLock(key, async () => {
      await this.retryOperation(async () => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`SecureStore.setItem(${key}):`, 'storing value');
        }

        // Store the value
        await SecureStore.setItemAsync(key, value);
        
        // Verify storage immediately
        const storedValue = await SecureStore.getItemAsync(key);
        if (!storedValue) {
          throw new Error('Storage verification failed');
        }

        // Additional verification that stored value matches
        if (storedValue !== value) {
          throw new Error('Stored value does not match original');
        }
      });
    });
  }

  async removeItem(key: string): Promise<void> {
    return this.withLock(key, async () => {
      try {
        if (process.env.NODE_ENV === 'development') {
          console.log(`SecureStore.removeItem(${key})`);
        }
        await SecureStore.deleteItemAsync(key);
      } catch (error) {
        console.error(`SecureStore removeItem failed:`, error);
      }
    });
  }
}

// Initialize the Supabase client
export const initializeSupabase = async () => {
  const storage = new EnhancedSecureStoreAdapter();
  
  const options: SupabaseClientOptions<'public'> = {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
      flowType: 'pkce',
      debug: process.env.NODE_ENV === 'development',
    },
  };

  const client = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    options,
  );

  // Ensure storage is properly initialized
  try {
    const initialSession = await storage.getItem('dollartracker-auth');
    if (process.env.NODE_ENV === 'development') {
      console.log('Initial session from storage:', initialSession ? 'found' : 'not found');
    }
    
    // If we have a session in storage, set it immediately
    if (initialSession) {
      const sessionData = JSON.parse(initialSession);
      await client.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      });
    }
  } catch (error) {
    console.error('Error initializing session:', error);
  }

  return client;
};

// Handle deep linking for email confirmation
import * as Linking from 'expo-linking';
Linking.addEventListener('url', async ({ url }) => {
  if (url.includes('confirmation_token=')) {
    const token = url.split('confirmation_token=')[1]?.split('&')[0];
    if (token) {
      try {
        const { error } = await initializeSupabase().then(client => client.auth.verifyOtp({
          token_hash: token,
          type: 'email',
        }));
        if (error) throw error;
        console.log('Email confirmed successfully');
      } catch (error) {
        console.error('Error confirming email:', error);
      }
    }
  }
});
