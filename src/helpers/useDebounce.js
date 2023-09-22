/* eslint-disable react-hooks/rules-of-hooks */
import { useMemo, useState, useEffect } from 'react';

/**
 * A hook that returns a debounced version of the given value.
 * @param {Function} value - the value to debounce
 * @param {number} delay - the delay in milliseconds
 * @returns {Function} the debounced value
 */
export default function useDebounce(value, delay) {
  if (typeof value === 'function') {
    const [id, setId] = useState(null);
    return useMemo(
      (...args) => {
        if (id) {
          clearTimeout(id);
        } else {
          setId(
            setTimeout(() => {
              setId(null);
              value(...args);
            }, delay),
          );
        }
      },
      [value],
    );
  }

  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}
