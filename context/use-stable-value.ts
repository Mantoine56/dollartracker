import { useRef, useEffect, useMemo } from 'react';

/**
 * Returns a stable reference to a value that only updates when the value changes
 * Useful for preventing unnecessary re-renders in context consumers
 */
export function useStableValue<T>(value: T): T {
  const ref = useRef(value);

  useEffect(() => {
    if (!Object.is(ref.current, value)) {
      ref.current = value;
    }
  }, [value]);

  return ref.current;
}

/**
 * Creates a stable callback that only changes when its dependencies change
 * Useful for context methods that are passed down to children
 */
export function useStableCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: React.DependencyList
): T {
  return useMemo(() => callback, deps);
}

/**
 * Creates a selector function that only updates when the selected value changes
 * Useful for accessing specific parts of context state without causing re-renders
 */
export function createSelector<State, Selected>(
  selector: (state: State) => Selected
) {
  let lastState: State | undefined;
  let lastSelected: Selected | undefined;

  return function memoizedSelector(state: State): Selected {
    if (!lastState || !Object.is(lastState, state)) {
      lastState = state;
      const nextSelected = selector(state);
      if (!Object.is(lastSelected, nextSelected)) {
        lastSelected = nextSelected;
      }
    }
    return lastSelected as Selected;
  };
}
