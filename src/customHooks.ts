import { useRef, useEffect, useCallback } from 'react';

/**
 * A hook that returns a debounced version of the passed function.
 *
 * @template T - The type of the function being debounced.
 * @param {T} callback - The function to debounce.
 * @param {number} delay - The delay in milliseconds.
 * @returns {Function} - The debounced function.
 */
// T extends (...args: any[]) => any enforces that 'callback' must be a function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  
  // Use a ref to store the timeout ID
  // ReturnType<typeof setTimeout> handles both Node (testing) and Browser environments
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Keep track of the latest callback to avoid dependency issues
  const callbackRef = useRef<T>(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Return a memoized version of the function
  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        if (callbackRef.current) {
          callbackRef.current(...args);
        }
      }, delay);
    },
    [delay]
  );
}

export {useDebounce};