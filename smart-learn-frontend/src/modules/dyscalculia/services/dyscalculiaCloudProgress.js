import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

import { db } from '../../../services/firebaseConfig';

const progressRef = (uid) => doc(db, 'userProfiles', uid, 'progress', 'dyscalculia');

export const loadDyscalculiaCloudProgress = async (uid) => {
  if (!uid) return null;
  const snapshot = await getDoc(progressRef(uid));
  if (!snapshot.exists()) return null;
  return snapshot.data()?.progress || null;
};

export const saveDyscalculiaCloudProgress = async (uid, progress) => {
  if (!uid || !progress) return;
  await setDoc(progressRef(uid), {
    module: 'dyscalculia',
    version: 1,
    progress,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
