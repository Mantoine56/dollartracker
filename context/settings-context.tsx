import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';
import { useUser } from './user-context';
import { supabase } from '../lib/supabase';

interface SettingsState {
  theme: 'system' | 'light' | 'dark';
  notificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
  customBudgetPeriod: string | null;
  dailyBudget: number;
  exportPreferences: any | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSynced: Date | null;
}

const initialState: SettingsState = {
  theme: 'system',
  notificationsEnabled: true,
  emailNotificationsEnabled: true,
  customBudgetPeriod: null,
  dailyBudget: 50,
  exportPreferences: null,
  isLoading: true,
  isSaving: false,
  error: null,
  lastSynced: null,
};

type SettingsAction =
  | { type: 'SET_SETTINGS'; payload: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SAVING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SYNC_SUCCESS' }
  | { type: 'REVERT_SETTINGS'; payload: Partial<SettingsState> };

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return { ...state, ...action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SYNC_SUCCESS':
      return { ...state, lastSynced: new Date() };
    case 'REVERT_SETTINGS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

interface SettingsContextValue {
  state: SettingsState;
  updateSettings: (settings: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>>) => Promise<void>;
  resetError: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { userId } = useUser();

  const fetchSettings = useCallback(async () => {
    if (!userId) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      if (data) {
        console.log('Found existing settings:', data);
        dispatch({
          type: 'SET_SETTINGS',
          payload: {
            theme: data.theme || 'system',
            notificationsEnabled: data.notifications_enabled,
            emailNotificationsEnabled: data.email_notifications_enabled,
            customBudgetPeriod: data.custom_budget_period,
            exportPreferences: data.export_preferences,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch settings' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [userId]);

  const updateSettings = useCallback(async (newSettings: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>>) => {
    if (!userId) return;

    try {
      dispatch({ type: 'SET_SAVING', payload: true });
      
      const settingsToUpdate = {
        theme: newSettings.theme,
        notifications_enabled: newSettings.notificationsEnabled,
        email_notifications_enabled: newSettings.emailNotificationsEnabled,
        custom_budget_period: newSettings.customBudgetPeriod,
        export_preferences: newSettings.exportPreferences,
        user_id: userId,
      };

      console.log('Updating settings with:', settingsToUpdate);

      const { error } = await supabase
        .from('user_settings')
        .upsert(settingsToUpdate);

      if (error) throw error;

      dispatch({ type: 'SET_SETTINGS', payload: newSettings });
      dispatch({ type: 'SYNC_SUCCESS' });
      console.log('Successfully updated settings');
    } catch (error) {
      console.error('Error updating settings:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update settings' });
      dispatch({ type: 'REVERT_SETTINGS', payload: state });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  }, [userId, state]);

  const resetError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <SettingsContext.Provider value={{ state, updateSettings, resetError }}>
      {children}
    </SettingsContext.Provider>
  );
}

export default SettingsProvider;
