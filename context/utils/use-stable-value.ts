import { useRef, useEffect, useMemo, useCallback } from 'react';

/**
 * Returns a stable reference to a value that only updates when the value changes
 * @example
 * ```ts
 * const settings = useSettings();
 * const theme = useStableValue(settings.theme);
 * ```
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);

  if (!Object.is(ref.current, value)) {
    ref.current = value;
  }

  return ref.current;
}

/**
 * Creates a stable callback that only changes when its dependencies change
 * @example
 * ```ts
 * const callback = useStableCallback(
 *   () => console.log(count),
 *   [count]
 * );
 * ```
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback(
    ((...args) => callbackRef.current(...args)) as T,
    deps
  );
}

interface SelectorOptions<T> {
  equalityFn?: (a: T, b: T) => boolean;
  debugLabel?: string;
}

/**
 * Creates a memoized selector that only updates when the selected value changes
 * @example
 * ```ts
 * const selectUserName = createSelector(
 *   (state: AppState) => state.user.name,
 *   { debugLabel: 'selectUserName' }
 * );
 * ```
 */
export function createSelector<State, Selected>(
  selector: (state: State) => Selected,
  options: SelectorOptions<Selected> = {}
) {
  const { equalityFn = Object.is, debugLabel } = options;
  let lastState: State | undefined;
  let lastSelected: Selected | undefined;
  let lastRan: number | undefined;

  return function memoizedSelector(state: State): Selected {
    const now = Date.now();

    if (!lastState || !Object.is(lastState, state)) {
      lastState = state;
      const nextSelected = selector(state);

      if (!lastSelected || !equalityFn(lastSelected, nextSelected)) {
        if (__DEV__ && debugLabel) {
          const timeSinceLastRun = lastRan ? now - lastRan : 0;
          console.log(
            `[${debugLabel}] Value changed after ${timeSinceLastRun}ms:`,
            { from: lastSelected, to: nextSelected }
          );
        }
        lastSelected = nextSelected;
      }
    }

    lastRan = now;
    return lastSelected as Selected;
  };
}

/**
 * Batches multiple state updates into a single update
 * @example
 * ```ts
 * const batchedUpdates = useBatchUpdates();
 * 
 * batchedUpdates(() => {
 *   setValue1(newValue1);
 *   setValue2(newValue2);
 * });
 * ```
 */
export function useBatchUpdates() {
  return useCallback((callback: () => void) => {
    if (typeof window !== 'undefined' && 'requestAnimationFrame' in window) {
      requestAnimationFrame(() => {
        callback();
      });
    } else {
      Promise.resolve().then(callback);
    }
  }, []);
}

/**
 * Debounces a value update
 * @example
 * ```ts
 * const debouncedValue = useDebounceValue(value, 500);
 * ```
 */
export function useDebounceValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
