import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { useSupabase } from './supabase';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
}

export const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: React.ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
  const { supabase, isReady } = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMounted = useRef(true);
  const authSubscription = useRef<{ unsubscribe: () => void } | null>(null);

  // Safe state updates
  const safeSetState = <T extends any>(setter: React.Dispatch<React.SetStateAction<T>>) => (value: T) => {
    if (isMounted.current) {
      setter(value);
    }
  };

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (process.env.NODE_ENV === 'development') {
      console.log('UserProvider - Current state:', { hasError: !!error, isLoading, userId: user?.id });
      console.log('UserProvider - Initializing');
    }

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          if (sessionError.message === 'Auth session missing!') {
            // This is expected when not logged in
            safeSetState(setUser)(null);
          } else {
            throw sessionError;
          }
        } else if (session) {
          safeSetState(setUser)(session.user);
        }

        // Set up auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('Auth state changed:', { event, user: session?.user?.email });
            }

            if (event === 'SIGNED_OUT') {
              safeSetState(setUser)(null);
            } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (session?.user) {
                safeSetState(setUser)(session.user);
              }
            }
          }
        );

        authSubscription.current = subscription;
        safeSetState(setIsLoading)(false);
      } catch (err) {
        if (process.env.NODE_ENV === 'development') {
          console.error('UserProvider - Error initializing:', err);
        }
        safeSetState(setError)(err as Error);
        safeSetState(setIsLoading)(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted.current = false;
      if (authSubscription.current) {
        authSubscription.current.unsubscribe();
      }
    };
  }, [supabase, isReady]);

  return (
    <UserContext.Provider value={{ user, isLoading, error }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
