import { createContext, useContext, useRef, useEffect, useState } from 'react';

interface ContextOptions<T> {
  name: string;
  defaultValue?: T;
  devWarnings?: boolean;
  validateValue?: (value: T) => boolean;
}

/**
 * Creates a type-safe context with enhanced debugging and validation
 * @example
 * ```ts
 * interface UserContextValue {
 *   user: User | null;
 *   loading: boolean;
 * }
 * 
 * const [UserProvider, useUser] = createSafeContext<UserContextValue>({
 *   name: 'User',
 *   validateValue: (value) => value.user !== undefined,
 * });
 * ```
 */
export function createSafeContext<T extends object>({
  name,
  defaultValue,
  devWarnings = true,
  validateValue,
}: ContextOptions<T>) {
  const Context = createContext<T | undefined>(defaultValue);
  Context.displayName = name;

  function Provider({
    children,
    value,
    onError,
  }: {
    children: React.ReactNode;
    value: T;
    onError?: (error: Error) => void;
  }) {
    const valueRef = useRef(value);

    useEffect(() => {
      valueRef.current = value;
    }, [value]);

    // Development-only validations
    if (process.env.NODE_ENV === 'development' && devWarnings) {
      useEffect(() => {
        if (validateValue && !validateValue(value)) {
          const error = new Error(`Invalid ${name}Context value`);
          console.error(error);
          onError?.(error);
        }
      }, [value, onError]);
    }

    return <Context.Provider value={value}>{children}</Context.Provider>;
  }

  function useContextSafely(customErrorMessage?: string) {
    const context = useContext(Context);
    if (context === undefined) {
      throw new Error(
        customErrorMessage ??
        `use${name} must be used within a ${name}Provider`
      );
    }
    return context;
  }

  return [Provider, useContextSafely, Context] as const;
}

/**
 * Creates an async context that handles loading and error states
 * @example
 * ```ts
 * const [AuthProvider, useAuth] = createAsyncContext({
 *   name: 'Auth',
 *   loadValue: async () => {
 *     const session = await getSession();
 *     return { user: session?.user ?? null };
 *   },
 * });
 * ```
 */
export function createAsyncContext<T extends object>({
  name,
  loadValue,
  validateValue,
}: ContextOptions<T> & {
  loadValue: () => Promise<T>;
}) {
  type AsyncContextValue = {
    value: T | null;
    loading: boolean;
    error: Error | null;
    reload: () => Promise<void>;
  };

  const [Provider, useContext] = createSafeContext<AsyncContextValue>({
    name: `Async${name}`,
    validateValue: (value) => value.value !== undefined,
  });

  function AsyncProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AsyncContextValue>({
      value: null,
      loading: true,
      error: null,
      reload: async () => {
        setState(s => ({ ...s, loading: true, error: null }));
        try {
          const value = await loadValue();
          if (validateValue && !validateValue(value)) {
            throw new Error(`Invalid ${name} value loaded`);
          }
          setState({ value, loading: false, error: null, reload });
        } catch (error) {
          setState(s => ({
            ...s,
            loading: false,
            error: error instanceof Error ? error : new Error(String(error)),
          }));
        }
      },
    });

    useEffect(() => {
      state.reload();
    }, []);

    return <Provider value={state}>{children}</Provider>;
  }

  return [AsyncProvider, useContext] as const;
}
