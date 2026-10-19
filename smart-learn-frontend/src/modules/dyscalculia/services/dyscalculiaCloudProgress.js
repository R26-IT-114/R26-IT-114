import { doc, getDoc, runTransaction, serverTimestamp } from 'firebase/firestore';

import { db } from '../../../services/firebaseConfig';
import { mergeDyscalculiaProgress } from '../utils/dyscalculiaProgress';

const progressRef = (uid) => doc(db, 'userProfiles', uid, 'progress', 'dyscalculia');

export const loadDyscalculiaCloudProgress = async (uid) => {
  if (!uid) return null;
  const snapshot = await getDoc(progressRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data()?.progress || null;
};

export const saveDyscalculiaCloudProgress = async (uid, progress) => {
  if (!uid || !progress) return;
  await runTransaction(db, async (transaction) => {
    const ref = progressRef(uid);
    const snapshot = await transaction.get(ref);
    const savedProgress = snapshot.exists() ? snapshot.data()?.progress : null;
    transaction.set(ref, {
      module: 'dyscalculia',
      version: 4,
      progress: mergeDyscalculiaProgress(savedProgress, progress),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  });
};
