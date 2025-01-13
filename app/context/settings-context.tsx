import { createContext, useContext, useEffect, useReducer } from 'react';
import { useSupabase } from './supabase-context';
import { useUser } from './user-context';

interface SettingsState {
  budgetPeriod: 'weekly' | 'biweekly' | 'monthly';
  theme: 'system' | 'light' | 'dark';
  notifications: {
    pushEnabled: boolean;
    emailDigest: boolean;
    achievements: boolean;
    budgetAlerts: boolean;
  };
  security: {
    biometricEnabled: boolean;
    lockTimeout: number;
  };
  isLoading: boolean;
  error: string | null;
}

type SettingsAction =
  | { type: 'SET_SETTINGS'; payload: Partial<SettingsState> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

const initialState: SettingsState = {
  budgetPeriod: 'monthly',
  theme: 'system',
  notifications: {
    pushEnabled: true,
    emailDigest: true,
    achievements: true,
    budgetAlerts: true,
  },
  security: {
    biometricEnabled: false,
    lockTimeout: 300000, // 5 minutes in milliseconds
  },
  isLoading: true,
  error: null,
};

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, ...action.payload, error: null };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
}

const SettingsContext = createContext<{
  state: SettingsState;
  updateSettings: (settings: Partial<SettingsState>) => Promise<void>;
} | null>(null);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { supabase } = useSupabase();
  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    
    async function loadSettings() {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          dispatch({
            type: 'SET_SETTINGS',
            payload: {
              budgetPeriod: data.budget_period,
              theme: data.theme,
              notifications: data.notifications,
              security: data.security,
            },
          });
        }
      } catch (error) {
        dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    }

    loadSettings();
  }, [user, supabase]);

  async function updateSettings(newSettings: Partial<SettingsState>) {
    if (!user) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      const { error } = await supabase
        .from('settings')
        .upsert({
          id: user.id,
          budget_period: newSettings.budgetPeriod ?? state.budgetPeriod,
          theme: newSettings.theme ?? state.theme,
          notifications: newSettings.notifications ?? state.notifications,
          security: newSettings.security ?? state.security,
        });

      if (error) throw error;

      dispatch({ type: 'SET_SETTINGS', payload: newSettings });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: (error as Error).message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }

  return (
    <SettingsContext.Provider value={{ state, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
