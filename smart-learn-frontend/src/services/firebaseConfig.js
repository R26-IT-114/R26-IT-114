import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : {};

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || 'AIzaSyCBKG0SFDsot5eZuxVAPhfWuoINsmKQ5EE',
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || 'smartlearn-9501c.firebaseapp.com',
  projectId: env.VITE_FIREBASE_PROJECT_ID || 'smartlearn-9501c',
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || 'smartlearn-9501c.firebasestorage.app',
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123798762965',
  appId: env.VITE_FIREBASE_APP_ID || '1:123798762965:web:3f95e787d0e614174bf95c',
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || 'G-0S2L7Q1P6C',
};

export const googleWebClientId = env.VITE_GOOGLE_WEB_CLIENT_ID || '';

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analyticsPromise = isSupported().then((supported) => {
  if (!supported) {
    return null;
  }

  return getAnalytics(app);
});
