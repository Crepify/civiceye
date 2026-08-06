import { useEffect, useState } from 'react';

/**
 * Debounce a rapidly changing value (e.g. a search box input).
 * Returns the value only after it has been stable for `delay` ms.
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
