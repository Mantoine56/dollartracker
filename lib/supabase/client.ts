import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import Constants from 'expo-constants';

if (!Constants.expoConfig?.extra?.supabaseUrl || !Constants.expoConfig?.extra?.supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your app.config.ts file.');
}

const supabaseUrl = Constants.expoConfig.extra.supabaseUrl as string;
const supabaseAnonKey = Constants.expoConfig.extra.supabaseAnonKey as string;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
