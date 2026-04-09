import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyDq6Ba5WH8SLg6IfeNM-bE-xl4ZekA2bLk',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'smartlearn-5f326.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'smartlearn-5f326',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'smartlearn-5f326.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '651093368708',
  appId: env.VITE_FIREBASE_APP_ID || '1:651093368708:web:98ab0ae1f568238f7c87d1',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-CX5PLC3TGE',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analyticsPromise = isSupported().then((supported) => {
  if (!supported) {
    return null;
  }

  return getAnalytics(app);
});
