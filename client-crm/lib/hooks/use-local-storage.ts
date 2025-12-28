import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for managing localStorage with React state synchronization
 * @param key - localStorage key
 * @param initialValue - initial value if key doesn't exist
 * @returns [storedValue, setValue] - current value and setter function
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    console.log(`[useLocalStorage] Initializing key: "${key}", initialValue:`, initialValue);
    if (typeof window === 'undefined') {
      console.log(`[useLocalStorage] Window is undefined, returning initialValue`);
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      console.log(`[useLocalStorage] Read from localStorage - key: "${key}", raw value:`, item);
      const parsedValue = item ? JSON.parse(item) : initialValue;
      console.log(`[useLocalStorage] Returning parsed value:`, parsedValue);
      return parsedValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setStoredValue((prevValue) => {
          // Allow value to be a function so we have same API as useState
          const valueToStore = value instanceof Function ? value(prevValue) : value;
          if (typeof window !== 'undefined') {
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
          }
          return valueToStore;
        });
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key]
  );

  return [storedValue, setValue];
}

