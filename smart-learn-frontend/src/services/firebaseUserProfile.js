import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from './firebaseConfig';

const USER_PROFILES_COLLECTION = 'userProfiles';
const ADMIN_AUDIT_LOGS_COLLECTION = 'adminAuditLogs';
export const VALID_RECOMMENDATION_PATHS = [
  '/dyslexia',
  '/dysgraphia',
  '/dyscalculia',
  '/working-memory',
];
export const MAX_RECOMMENDATIONS_PER_USER = 4;

export const DEFAULT_RECOMMENDATIONS = [
  {
    label: 'Dyslexia',
    path: '/dyslexia',
    reason: 'Reading fluency focus',
  },
  {
    label: 'Working Memory',
    path: '/working-memory',
    reason: 'Attention and recall support',
  },
  {
    label: 'Dysgraphia',
    path: '/dysgraphia',
    reason: 'Handwriting coordination practice',
  },
  {
    label: 'Dyscalculia',
    path: '/dyscalculia',
    reason: 'Numeracy confidence building',
  },
];

const profileRef = (uid) => doc(db, USER_PROFILES_COLLECTION, uid);
const profilesCollection = () => collection(db, USER_PROFILES_COLLECTION);
const adminAuditLogsCollection = () => collection(db, ADMIN_AUDIT_LOGS_COLLECTION);

const sanitizeRecommendations = (recommendations) => {
  if (!Array.isArray(recommendations)) return [];

  return recommendations
    .filter((item) => item && item.label && item.path)
    .map((item) => ({
      label: item.label,
      path: item.path,
      reason: item.reason || '',
    }));
};

export const syncUserProfile = async (firebaseUser) => {
  if (!firebaseUser?.uid) return;

  const ref = profileRef(firebaseUser.uid);
  const snapshot = await getDoc(ref);

  const baseProfile = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    name: firebaseUser.displayName || '',
    photoURL: firebaseUser.photoURL || '',
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  };

  if (!snapshot.exists()) {
    await setDoc(ref, {
      ...baseProfile,
      role: 'student',
      createdAt: serverTimestamp(),
      recommendations: DEFAULT_RECOMMENDATIONS,
    });
    return;
  }

  await setDoc(
    ref,
    {
      ...baseProfile,
      role: snapshot.data()?.role || 'student',
    },
    { merge: true }
  );
};

export const fetchUserProfile = async (uid) => {
  if (!uid) return null;

  const snapshot = await getDoc(profileRef(uid));
  if (!snapshot.exists()) return null;

  const data = snapshot.data();

  return {
    uid,
    email: data?.email || '',
    name: data?.name || '',
    photoURL: data?.photoURL || '',
    role: data?.role || 'student',
    recommendations: sanitizeRecommendations(data?.recommendations),
  };
};

export const fetchUserRecommendations = async (uid) => {
  if (!uid) return [];

  const snapshot = await getDoc(profileRef(uid));
  if (!snapshot.exists()) return [];

  const data = snapshot.data();
  return sanitizeRecommendations(data?.recommendations);
};

export const listUserProfiles = async (maxResults = 30) => {
  const q = query(profilesCollection(), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs
    .map((profileDoc) => {
      const data = profileDoc.data();

      return {
        uid: profileDoc.id,
        email: data?.email || '',
        name: data?.name || '',
        role: data?.role || 'student',
        recommendations: sanitizeRecommendations(data?.recommendations),
      };
    })
    .sort((left, right) => {
      const leftName = (left.name || left.email || '').toLowerCase();
      const rightName = (right.name || right.email || '').toLowerCase();
      return leftName.localeCompare(rightName);
    });
};

export const updateUserRecommendations = async (uid, recommendations) => {
  if (!uid) {
    throw new Error('Missing user ID for recommendations update.');
  }

  const sanitized = sanitizeRecommendations(recommendations);

  if (sanitized.length === 0) {
    throw new Error('At least one recommendation is required.');
  }

  if (sanitized.length > MAX_RECOMMENDATIONS_PER_USER) {
    throw new Error(`Maximum ${MAX_RECOMMENDATIONS_PER_USER} recommendations allowed.`);
  }

  const hasInvalidPath = sanitized.some((item) => !VALID_RECOMMENDATION_PATHS.includes(item.path));

  if (hasInvalidPath) {
    throw new Error('Recommendations contain unsupported module paths.');
  }

  await setDoc(
    profileRef(uid),
    {
      recommendations: sanitized,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return sanitized;
};

export const createAdminAuditLog = async ({
  action,
  actorUid,
  actorRole,
  targetUid,
  details = {},
}) => {
  if (!action || !actorUid || !targetUid) {
    throw new Error('Invalid audit log payload.');
  }

  await addDoc(adminAuditLogsCollection(), {
    action,
    actorUid,
    actorRole: actorRole || 'unknown',
    targetUid,
    details,
    createdAt: serverTimestamp(),
  });
};

export const updateUserRole = async (uid, role) => {
  const allowedRoles = ['student', 'therapist', 'admin'];

  if (!uid) {
    throw new Error('Missing user ID for role update.');
  }

  if (!allowedRoles.includes(role)) {
    throw new Error('Invalid role value.');
  }

  await setDoc(
    profileRef(uid),
    {
      role,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );

  return role;
};
