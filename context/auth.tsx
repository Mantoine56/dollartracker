import { createSafeContext } from './utils/create-safe-context';
import { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import { useStableCallback, useStableValue } from './utils/use-stable-value';
import { useEffect, useState, useCallback } from 'react';
import { useSupabase } from './supabase';

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
  const { supabase, isReady } = useSupabase();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize auth state
  useEffect(() => {
    if (!isReady) {
      return;
    }

    let mounted = true;
    let authSubscription: { unsubscribe: () => void } | null = null;

    const initialize = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!mounted) return;

            if (event === 'SIGNED_OUT') {
              setSession(null);
              setUser(null);
            } else if (newSession) {
              setSession(newSession);
              setUser(newSession.user);
            }
          }
        );

        authSubscription = subscription;
      } catch (err) {
        if (mounted) {
          setError(err as Error);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, [isReady, supabase]);

  const resetError = useCallback(() => setError(null), []);

  const signInWithGoogle = useStableCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });

  const signInWithApple = useStableCallback(async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'apple',
        options: {
          redirectTo: redirectUrl,
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });

  const signInWithEmail = useStableCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });

  const signUpWithEmail = useStableCallback(async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });
      if (error) throw error;
      return { needsEmailConfirmation: true };
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });

  const signOut = useStableCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  });

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
