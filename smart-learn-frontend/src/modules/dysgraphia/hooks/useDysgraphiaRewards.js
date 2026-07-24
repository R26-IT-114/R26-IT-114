import { useCallback, useEffect, useState } from 'react';
import { dysgraphiaService } from '../services/dysgraphiaService';

export const useDysgraphiaRewards = () => {
  const [totalStars, setTotalStars] = useState(() => dysgraphiaService.getCachedOverview()?.stats?.totalStars || 0);
  const [rewardPulse, setRewardPulse] = useState(false);

  useEffect(() => {
    const unsubscribe = dysgraphiaService.subscribeToOverview((overview) => {
      setTotalStars(overview?.stats?.totalStars || 0);
    });

    if (!dysgraphiaService.getCachedOverview()) {
      dysgraphiaService.getOverview().catch(() => {});
    }

    return unsubscribe;
  }, []);

  const awardStars = useCallback((amount = 1) => {
    if (!Number.isFinite(amount) || amount <= 0) return;

    setRewardPulse(true);
    window.setTimeout(() => setRewardPulse(false), 700);
  }, []);

  return { totalStars, rewardPulse, awardStars };
};
