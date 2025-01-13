import { createContext, useCallback, useContext, useReducer, useEffect } from 'react';
import { useUser } from './user';
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

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const { user } = useUser();

  const loadSettings = useCallback(async () => {
    if (!user) return;
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('Creating default settings for new user');
          const defaultSettings = {
            id: user.id,
            user_id: user.id,
            theme: initialState.theme,
            notifications_enabled: initialState.notificationsEnabled,
            email_notifications_enabled: initialState.emailNotificationsEnabled,
            custom_budget_period: initialState.customBudgetPeriod,
            daily_budget: initialState.dailyBudget,
            export_preferences: initialState.exportPreferences,
          };
          
          console.log('Default settings object:', defaultSettings);
          
          const { error: insertError, data: insertedData } = await supabase
            .from('settings')
            .insert([defaultSettings])
            .select()
            .single();

          if (insertError) {
            console.error('Error creating default settings:', insertError);
            throw insertError;
          }

          console.log('Successfully inserted settings:', insertedData);

          dispatch({
            type: 'SET_SETTINGS',
            payload: {
              theme: insertedData.theme,
              notificationsEnabled: insertedData.notifications_enabled,
              emailNotificationsEnabled: insertedData.email_notifications_enabled,
              customBudgetPeriod: insertedData.custom_budget_period,
              dailyBudget: insertedData.daily_budget,
              exportPreferences: insertedData.export_preferences,
            },
          });
        } else {
          throw error;
        }
      } else if (data) {
        console.log('Found existing settings:', data);
        dispatch({
          type: 'SET_SETTINGS',
          payload: {
            theme: data.theme,
            notificationsEnabled: data.notifications_enabled,
            emailNotificationsEnabled: data.email_notifications_enabled,
            customBudgetPeriod: data.custom_budget_period,
            dailyBudget: data.daily_budget,
            exportPreferences: data.export_preferences,
          },
        });
      }
      
      dispatch({ type: 'SYNC_SUCCESS' });
    } catch (error) {
      console.error('Error loading settings:', error);
      const message = error instanceof Error ? error.message : 'Failed to load settings';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const updateSettings = async (newSettings: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>>) => {
    if (!user) return;

    const previousState = {
      theme: state.theme,
      notificationsEnabled: state.notificationsEnabled,
      emailNotificationsEnabled: state.emailNotificationsEnabled,
      customBudgetPeriod: state.customBudgetPeriod,
      dailyBudget: state.dailyBudget,
      exportPreferences: state.exportPreferences,
    };

    try {
      const updateData = {
        id: user.id,
        user_id: user.id,
        theme: newSettings.theme ?? state.theme,
        notifications_enabled: newSettings.notificationsEnabled ?? state.notificationsEnabled,
        email_notifications_enabled: newSettings.emailNotificationsEnabled ?? state.emailNotificationsEnabled,
        custom_budget_period: newSettings.customBudgetPeriod ?? state.customBudgetPeriod,
        daily_budget: newSettings.dailyBudget ?? state.dailyBudget,
        export_preferences: newSettings.exportPreferences ?? state.exportPreferences,
      };

      console.log('Updating settings with:', updateData);

      dispatch({ type: 'SET_SETTINGS', payload: newSettings });
      dispatch({ type: 'SET_SAVING', payload: true });

      const { error } = await supabase
        .from('settings')
        .upsert(updateData);

      if (error) throw error;
      
      console.log('Successfully updated settings');
      console.log('Current theme:', state.theme);
      dispatch({ type: 'SYNC_SUCCESS' });
    } catch (error) {
      console.error('Error updating settings:', error);
      dispatch({ type: 'REVERT_SETTINGS', payload: previousState });
      const message = error instanceof Error ? error.message : 'Failed to update settings';
      dispatch({ type: 'SET_ERROR', payload: message });
    } finally {
      dispatch({ type: 'SET_SAVING', payload: false });
    }
  };

  const resetError = () => dispatch({ type: 'SET_ERROR', payload: null });

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, loadSettings]);

  return (
    <SettingsContext.Provider value={{ state, updateSettings, resetError }}>
      {children}
    </SettingsContext.Provider>
  );
}
