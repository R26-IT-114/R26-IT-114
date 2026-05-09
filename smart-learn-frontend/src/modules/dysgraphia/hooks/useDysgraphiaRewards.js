import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'smartlearn.dysgraphia.stars';

const readStoredStars = () => {
  if (typeof window === 'undefined') return 0;

  const stored = window.localStorage.getItem(STORAGE_KEY);
  const parsed = Number.parseInt(stored ?? '0', 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
};

export const useDysgraphiaRewards = () => {
  const [totalStars, setTotalStars] = useState(readStoredStars);
  const [rewardPulse, setRewardPulse] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(STORAGE_KEY, String(totalStars));
  }, [totalStars]);

  const awardStars = useCallback((amount = 1) => {
    if (!Number.isFinite(amount) || amount <= 0) return;

    setTotalStars((current) => current + amount);
    setRewardPulse(true);
    window.setTimeout(() => setRewardPulse(false), 700);
  }, []);

  return { totalStars, rewardPulse, awardStars };
};
