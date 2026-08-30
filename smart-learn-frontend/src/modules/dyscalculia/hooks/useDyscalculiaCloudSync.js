import { useEffect, useRef } from 'react';

import useAuth from '../../../hooks/useAuth';
import { loadDyscalculiaCloudProgress, saveDyscalculiaCloudProgress } from '../services/dyscalculiaCloudProgress';
import { getDyscalculiaProgress, saveDyscalculiaProgress } from '../utils/dyscalculiaProgress';

const PROGRESS_EVENT = 'dyscalculia:progress-updated';

const latestActivityTime = (progress) => {
  const sessions = Array.isArray(progress?.sessions) ? progress.sessions : [];
  return sessions.reduce((latest, session) => Math.max(latest, Date.parse(session?.playedAt) || 0), 0);
};

const preferLocalProgress = (local, cloud) => {
  const localTime = latestActivityTime(local);
  const cloudTime = latestActivityTime(cloud);
  if (localTime !== cloudTime) return localTime > cloudTime;
  return (Number(local?.overallStats?.totalGames) || 0) > (Number(cloud?.overallStats?.totalGames) || 0);
};

const useDyscalculiaCloudSync = () => {
  const { user, isAuthLoading } = useAuth();
  const uid = user?.id || user?.uid;
  const hydratingRef = useRef(false);

  useEffect(() => {
    if (isAuthLoading || !uid) return undefined;
    let cancelled = false;
    let saveTimer;

    const hydrate = async () => {
      hydratingRef.current = true;
      try {
        const local = getDyscalculiaProgress();
        const cloud = await loadDyscalculiaCloudProgress(uid);
        if (cancelled) return;
        if (!cloud || preferLocalProgress(local, cloud)) {
          await saveDyscalculiaCloudProgress(uid, local);
        } else {
          saveDyscalculiaProgress(cloud);
        }
      } catch (error) {
        console.warn('Dyscalculia cloud progress sync unavailable:', error);
      } finally {
        hydratingRef.current = false;
      }
    };

    const queueCloudSave = () => {
      if (hydratingRef.current) return;
      window.clearTimeout(saveTimer);
      saveTimer = window.setTimeout(() => {
        saveDyscalculiaCloudProgress(uid, getDyscalculiaProgress()).catch((error) => {
          console.warn('Unable to save Dyscalculia progress to Firestore:', error);
        });
      }, 650);
    };

    hydrate();
    window.addEventListener(PROGRESS_EVENT, queueCloudSave);
    return () => {
      cancelled = true;
      window.clearTimeout(saveTimer);
      if (saveTimer && !hydratingRef.current) {
        saveDyscalculiaCloudProgress(uid, getDyscalculiaProgress()).catch(() => {});
      }
      window.removeEventListener(PROGRESS_EVENT, queueCloudSave);
    };
  }, [isAuthLoading, uid]);
};

export default useDyscalculiaCloudSync;
