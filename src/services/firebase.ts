import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

/** Firebase configuration sourced from environment variables (never hardcoded). */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
  import.meta.env.VITE_ENABLE_ANALYTICS === 'true' && typeof window !== 'undefined'
    ? getAnalytics(app)
    : null;

/** Connect to local emulators in development mode. */
if (import.meta.env.VITE_USE_EMULATOR === 'true' && import.meta.env.DEV) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch {
    // Emulators already connected — safe to ignore
  }
}

export default app;
