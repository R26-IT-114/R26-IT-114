import { useEffect } from 'react';

import useAuth from '../../../hooks/useAuth';
import { loadDyscalculiaCloudProgress, saveDyscalculiaCloudProgress } from '../services/dyscalculiaCloudProgress';
import {
  getDyscalculiaProgress,
  mergeDyscalculiaProgress,
  saveDyscalculiaProgress,
  setDyscalculiaLearnerId,
} from '../utils/dyscalculiaProgress';

const PROGRESS_EVENT = 'dyscalculia:progress-updated';

const latestActivityTime = (progress) => {
  const sessions = Array.isArray(progress?.sessions) ? progress.sessions : [];
  return sessions.reduce((latest, session) => Math.max(latest, Date.parse(session?.playedAt) || 0), 0);
};

const latestResetTime = (progress) => Object.values(progress?.gameResetAt || {}).reduce(
  (latest, timestamp) => Math.max(latest, Date.parse(timestamp) || 0),
  0,
);

const preferLocalProgress = (local, cloud) => {
  if (latestResetTime(local) !== latestResetTime(cloud)) {
    return latestResetTime(local) > latestResetTime(cloud);
  }
  const localTime = latestActivityTime(local);
  const cloudTime = latestActivityTime(cloud);
  if (localTime !== cloudTime) return localTime > cloudTime;
  return (Number(local?.overallStats?.totalGames) || 0) > (Number(cloud?.overallStats?.totalGames) || 0);
};

const useDyscalculiaCloudSync = () => {
  const { user, isAuthLoading } = useAuth();
  const uid = user?.id || user?.uid;
  setDyscalculiaLearnerId(uid || null);

  useEffect(() => {
    if (isAuthLoading || !uid) return undefined;
    let cancelled = false;
    let saveTimer;
    let hydrating = false;
    let pendingProgress = null;

    const hydrate = async () => {
      hydrating = true;
      try {
        const local = getDyscalculiaProgress();
        const cloud = await loadDyscalculiaCloudProgress(uid);
        if (cancelled) return;
        if (!cloud) {
          await saveDyscalculiaCloudProgress(uid, local);
          return;
        }
        const preferred = preferLocalProgress(local, cloud) ? local : cloud;
        const merged = mergeDyscalculiaProgress(cloud, {
          ...preferred,
          gameResetAt: { ...(cloud.gameResetAt || {}), ...(local.gameResetAt || {}) },
        });
        saveDyscalculiaProgress(merged);
        await saveDyscalculiaCloudProgress(uid, merged);
      } catch (error) {
        console.warn('Dyscalculia cloud progress sync unavailable:', error);
      } finally {
        hydrating = false;
      }
    };

    const queueCloudSave = () => {
      if (hydrating) return;
      pendingProgress = getDyscalculiaProgress();
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveDyscalculiaCloudProgress(uid, pendingProgress).catch((error) => {
          console.warn('Unable to save Dyscalculia progress to Firestore:', error);
        });
      }, 650);
    };

    hydrate();
    window.addEventListener(PROGRESS_EVENT, queueCloudSave);
    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer);
      if (saveTimer && !hydrating && pendingProgress) {
        saveDyscalculiaCloudProgress(uid, pendingProgress).catch((error) => {
          console.warn('Unable to save Dyscalculia progress to Firestore:', error);
        });
      }
      window.removeEventListener(PROGRESS_EVENT, queueCloudSave);
    };
  }, [isAuthLoading, uid]);
};

export default useDyscalculiaCloudSync;
