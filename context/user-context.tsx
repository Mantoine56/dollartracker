import { createContext, useContext, useEffect, useReducer, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

interface UserState {
  userId: string | undefined;
  isLoading: boolean;
  hasError: boolean;
}

const initialState: UserState = {
  userId: undefined,
  isLoading: true,
  hasError: false,
};

type UserAction =
  | { type: 'SET_USER'; payload: string }
  | { type: 'CLEAR_USER' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: boolean };

function userReducer(state: UserState, action: UserAction): UserState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, userId: action.payload, hasError: false };
    case 'CLEAR_USER':
      return { ...state, userId: undefined };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, hasError: action.payload };
    default:
      return state;
  }
}

interface UserContextValue {
  userId: string | undefined;
  isLoading: boolean;
  hasError: boolean;
}

const UserContext = createContext<UserContextValue | null>(null);

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

function UserProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(userReducer, initialState);

  const handleAuthStateChange = useCallback(async (event: string, session: { user: User } | null) => {
    console.log('UserProvider - Auth state changed, user:', session?.user?.id);
    
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      if (session?.user) {
        dispatch({ type: 'SET_USER', payload: session.user.id });
      }
    }
    
    if (event === 'SIGNED_OUT') {
      dispatch({ type: 'CLEAR_USER' });
    }
    
    dispatch({ type: 'SET_LOADING', payload: false });
  }, []);

  const initializeUser = useCallback(async () => {
    console.log('UserProvider - Initializing');
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        console.log('UserProvider - Initial user:', user.id);
        dispatch({ type: 'SET_USER', payload: user.id });
      }
    } catch (error) {
      console.error('Error initializing user:', error);
      dispatch({ type: 'SET_ERROR', payload: true });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  useEffect(() => {
    initializeUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange, initializeUser]);

  useEffect(() => {
    console.log('UserProvider - Current state:', state);
  }, [state]);

  return (
    <UserContext.Provider value={state}>
      {children}
    </UserContext.Provider>
  );
}

export default UserProvider;
