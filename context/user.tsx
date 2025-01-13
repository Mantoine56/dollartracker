import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

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
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log('UserProvider - Initializing');
    
    // Get initial user
    supabase.auth.getUser()
      .then(({ data: { user }, error }) => {
        console.log('UserProvider - Initial user:', user?.id);
        if (error) {
          console.error('UserProvider - Error getting user:', error);
          setError(error);
        } else {
          setUser(user);
        }
        setIsLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('UserProvider - Auth state changed, user:', session?.user?.id);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      console.log('UserProvider - Cleanup');
      subscription.unsubscribe();
    };
  }, []);

  console.log('UserProvider - Current state:', {
    userId: user?.id,
    isLoading,
    hasError: !!error
  });

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
