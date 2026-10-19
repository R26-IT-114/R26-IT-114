import { useCallback, useEffect, useRef } from 'react';

// One transition per answer. Leaving/restarting a game cancels its pending move.
export default function useFeedbackAdvance(delay = 1100) {
  const pending = useRef(false);
  const timer = useRef(null);
  const cancel = useCallback(() => {
    window.clearTimeout(timer.current);
    timer.current = null;
    pending.current = false;
  }, []);
  const schedule = useCallback((advance) => {
    if (pending.current) return false;
    pending.current = true;
    timer.current = window.setTimeout(() => {
      timer.current = null;
      try { advance(); } finally { pending.current = false; }
    }, delay);
    return true;
  }, [delay]);
  useEffect(() => cancel, [cancel]);
  return { pending, schedule, cancel };
}
