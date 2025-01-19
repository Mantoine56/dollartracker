import { createContext, useContext } from 'react';

/**
 * Creates a type-safe context and hook with proper error handling
 * @template T The type of the context value
 * @param name The name of the context (used for error messages)
 * @param defaultValue Optional default value for the context
 */
export function createSafeContext<T>(name: string, defaultValue?: T) {
  const Context = createContext<T | undefined>(defaultValue);
  Context.displayName = name;

  function useContextSafely() {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(
        `use${name} must be used within a ${name}Provider`
      );
    }
    return context;
  }

  return [Context.Provider, useContextSafely, Context] as const;
}

/**
 * Type helper for creating context state with loading and error handling
 */
export interface AsyncContextState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Creates an initial state object for async contexts
 */
export function createInitialState<T>(): AsyncContextState<T> {
  return {
    data: null,
    isLoading: false,
    error: null,
  };
}

/**
 * Type helper for context actions
 */
export type ContextAction<T> =
  | { type: 'START_LOADING' }
  | { type: 'SET_DATA'; payload: T }
  | { type: 'SET_ERROR'; payload: Error }
  | { type: 'RESET' };

/**
 * Creates a reducer for handling async context state
 */
export function createAsyncReducer<T>() {
  return function reducer(
    state: AsyncContextState<T>,
    action: ContextAction<T>
  ): AsyncContextState<T> {
    switch (action.type) {
      case 'START_LOADING':
        return { ...state, isLoading: true, error: null };
      case 'SET_DATA':
        return { data: action.payload, isLoading: false, error: null };
      case 'SET_ERROR':
        return { ...state, isLoading: false, error: action.payload };
      case 'RESET':
        return createInitialState<T>();
      default:
        return state;
    }
  };
}
