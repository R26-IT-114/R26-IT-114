import { useCallback, useEffect, useRef } from 'react';

// A ref locks immediately, before React can render a disabled submit button.
export default function useSubmissionGuard() {
  const mounted = useRef(true);
  const active = useRef(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      active.current = null;
    };
  }, []);

  const begin = useCallback(() => {
    if (!mounted.current || active.current) return null;
    const token = {};
    active.current = token;
    return token;
  }, []);
  const isCurrent = useCallback((token) => token != null && mounted.current && active.current === token, []);
  const finish = useCallback((token) => {
    if (active.current === token) active.current = null;
  }, []);

  return { begin, isCurrent, finish };
}
