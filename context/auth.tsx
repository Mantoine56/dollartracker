import { createSafeContext } from './utils/create-safe-context';
import { Session, User } from '@supabase/supabase-js';
import { useSupabase } from './supabase';
import * as Linking from 'expo-linking';
import { useStableCallback, useStableValue } from './utils/use-stable-value';
import { useEffect, useState } from 'react';

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: Error | null;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ needsEmailConfirmation: boolean }>;
  resetError: () => void;
}

const [AuthProvider, useAuth] = createSafeContext<AuthContextValue>({
  name: 'Auth',
  validateValue: (value) => typeof value.loading === 'boolean',
});

const redirectUrl = Linking.createURL('/(auth)/confirm');

function AuthProviderComponent({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Stable callbacks
  const resetError = useStableCallback(() => setError(null), []);

  const signOut = useStableCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to sign out'));
    }
  }, [supabase]);

  const signInWithGoogle = useStableCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to sign in with Google'));
    }
  }, [supabase]);

  const signInWithApple = useStableCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: { redirectTo: redirectUrl },
      });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to sign in with Apple'));
    }
  }, [supabase]);

  const signInWithEmail = useStableCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to sign in with email'));
    }
  }, [supabase]);

  const signUpWithEmail = useStableCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: redirectUrl },
      });
      if (error) throw error;
      return { needsEmailConfirmation: true };
    } catch (error) {
      setError(error instanceof Error ? error : new Error('Failed to sign up'));
      return { needsEmailConfirmation: false };
    }
  }, [supabase]);

  // Session management
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const value = useStableValue({
    user,
    session,
    loading,
    error,
    signOut,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    signUpWithEmail,
    resetError,
  });

  return <AuthProvider value={value}>{children}</AuthProvider>;
}

export { AuthProviderComponent as AuthProvider, useAuth };
