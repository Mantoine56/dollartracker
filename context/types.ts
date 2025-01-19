import { Session, User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';

// Supabase Context Types
export interface SupabaseContextValue {
  supabase: SupabaseClient;
  isReady: boolean;
}

// Auth Context Types
export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
}

// User Context Types
export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface UserContextValue {
  profile: UserProfile | null;
  loading: boolean;
  error: Error | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

// Settings Context Types
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  currency: string;
  notifications: boolean;
  biometricEnabled: boolean;
}

export interface SettingsContextValue {
  settings: AppSettings;
  loading: boolean;
  error: Error | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}
