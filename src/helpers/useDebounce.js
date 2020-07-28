import { useMemo, useState } from 'react';

export default function useDebounce(func, delay) {
  const [id, setId] = useState(null);

  return useMemo(
    (...args) => {
      if (id) {
        clearTimeout(id);
      } else {
        setId(
          setTimeout(() => {
            setId(null);
            func(...args);
          }, delay)
        );
      }
    },
    [func]
  );
}
