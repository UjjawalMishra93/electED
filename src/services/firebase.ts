import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/** Firebase configuration sourced from environment variables (never hardcoded). */
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID,
};

/** Singleton Firebase app instance. */
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

/** Firebase Auth instance. */
export const auth = getAuth(app);

/** Firestore database instance. */
export const db = getFirestore(app);

/** Firebase Analytics (only in production). */
export const analytics =
  process.env.VITE_ENABLE_ANALYTICS === 'true' && typeof window !== 'undefined'
    ? getAnalytics(app)
    : null;

/** Connect to local emulators in development mode. */
if (process.env.VITE_USE_EMULATOR === 'true' && process.env.NODE_ENV !== 'production') {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch {
    // Emulators already connected — safe to ignore
  }
}

export default app;
