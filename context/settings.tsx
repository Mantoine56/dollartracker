import { createSafeContext } from './utils/create-safe-context';
import { useCallback, useEffect, useReducer, useRef, useMemo } from 'react';
import { useUser } from './user';
import { useSupabase } from './supabase';

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
  | { type: 'SYNC_SUCCESS' };

function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
  switch (action.type) {
    case 'SET_SETTINGS':
      return {
        ...state,
        ...action.payload,
        error: null,
        lastSynced: new Date(),
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_SAVING':
      return { ...state, isSaving: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false, isSaving: false };
    case 'SYNC_SUCCESS':
      return { ...state, lastSynced: new Date() };
    default:
      return state;
  }
}

interface SettingsContextValue {
  state: SettingsState;
  updateSettings: (settings: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>>) => Promise<void>;
  resetError: () => void;
}

const [SettingsProvider, useSettings] = createSafeContext<SettingsContextValue>({
  name: 'Settings',
  validateValue: (value) => !!value.state,
});

function SettingsProviderComponent({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase();
  const { profile } = useUser();
  const [state, dispatch] = useReducer(settingsReducer, initialState);
  const isMounted = useRef(true);
  const isInitialMount = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const safeDispatch = useCallback((action: SettingsAction) => {
    if (isMounted.current) {
      dispatch(action);
    }
  }, []);

  const resetError = useCallback(() => {
    safeDispatch({ type: 'SET_ERROR', payload: null });
  }, [safeDispatch]);

  const loadSettings = useCallback(async () => {
    if (!profile?.id) {
      safeDispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', profile.id)
        .single();

      if (error) throw error;

      if (data && isMounted.current) {
        safeDispatch({ type: 'SET_SETTINGS', payload: data });
      }
    } catch (error) {
      if (isMounted.current) {
        safeDispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to load settings'
        });
      }
    } finally {
      if (isMounted.current) {
        safeDispatch({ type: 'SET_LOADING', payload: false });
      }
    }
  }, [profile?.id, supabase, safeDispatch]);

  const updateSettings = useCallback(async (
    settings: Partial<Omit<SettingsState, 'isLoading' | 'isSaving' | 'error' | 'lastSynced'>>
  ) => {
    if (!profile?.id) return;

    safeDispatch({ type: 'SET_SAVING', payload: true });
    try {
      const { error } = await supabase
        .from('user_settings')
        .update(settings)
        .eq('user_id', profile.id);

      if (error) throw error;

      if (isMounted.current) {
        safeDispatch({ type: 'SET_SETTINGS', payload: settings });
      }
    } catch (error) {
      if (isMounted.current) {
        safeDispatch({
          type: 'SET_ERROR',
          payload: error instanceof Error ? error.message : 'Failed to update settings'
        });
        throw error; // Re-throw to allow error handling in tests
      }
    } finally {
      if (isMounted.current) {
        safeDispatch({ type: 'SET_SAVING', payload: false });
      }
    }
  }, [profile?.id, supabase, safeDispatch]);

  useEffect(() => {
    if (isInitialMount.current && profile?.id) {
      isInitialMount.current = false;
      loadSettings();
    }
  }, [profile?.id, loadSettings]);

  const value = useMemo(() => ({
    state,
    updateSettings,
    resetError,
  }), [state, updateSettings, resetError]);

  return <SettingsProvider value={value}>{children}</SettingsProvider>;
}

export { SettingsProviderComponent as SettingsProvider, useSettings };
