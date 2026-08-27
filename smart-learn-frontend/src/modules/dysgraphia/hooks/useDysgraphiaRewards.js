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

  const awardStars = useCallback((amount = 1, targetTotal = null) => {
    if (!Number.isFinite(amount) || amount <= 0) return;

    window.dispatchEvent(new CustomEvent('dysgraphia:star-award', {
      detail: {
        amount,
        targetTotal: Number.isFinite(targetTotal) ? targetTotal : null,
      },
    }));
    setRewardPulse(true);
    window.setTimeout(() => setRewardPulse(false), 700);
  }, []);

  const awardPracticeStars = useCallback((amount, details = {}) => {
    if (!Number.isFinite(amount) || amount <= 0) return Promise.resolve(null);
    const totalBeforeSave = Number(
      dysgraphiaService.getCachedOverview()?.stats?.totalStars || 0
    );
    // Show the newly earned stars in the total immediately. Once the save
    // finishes, the backend total below confirms the value and removes any
    // duplicate increase from replaying an already rewarded task.
    setTotalStars((currentTotal) => currentTotal + amount);
    // Start the celebration at task completion instead of waiting for the
    // network request. The saved overview controls the count at arrival.
    awardStars(amount, totalBeforeSave);
    const routeMatch = window.location.pathname.match(/\/letter-([^/]+)/i);
    const letterId = details.letterId || routeMatch?.[1]?.toLowerCase();
    if (!letterId) return Promise.resolve(null);

    return dysgraphiaService.submitLetterPracticeAttempt({
      letterId,
      task: details.task,
      starsEarned: amount,
      breakCount: details.breakCount,
      attemptNumber: details.attemptNumber,
      additionalNodesDisplayed: details.additionalNodesDisplayed,
    }).then((response) => {
      const savedTotal = Number(response?.overviewSummary?.stats?.totalStars);
      if (Number.isFinite(savedTotal)) {
        setTotalStars(savedTotal);
      }
      return response;
    }).catch((error) => {
      console.error('Could not save letter-practice stars.', error);
      return null;
    });
  }, [awardStars]);

  return { totalStars, rewardPulse, awardStars, awardPracticeStars };
};
