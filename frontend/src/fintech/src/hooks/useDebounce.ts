import { useCallback, useEffect, useRef } from 'react';

function useDebounce<T extends (...args: never[]) => void>(
  fn: T,
  delay = 600,
  deps: unknown[] = [],
): T {
  const fnRef = useRef(fn);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fnRef.current = fn;
  });

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        fnRef.current(...args);
      }, delay);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps,
  ) as T;
}

export default useDebounce;
