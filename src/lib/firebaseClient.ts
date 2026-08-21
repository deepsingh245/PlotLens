import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

/**
 * Single Firebase client bootstrap — see docs/ARCHITECTURE.md and
 * docs/ADR/0002-storage.md. Client SDK only; no firebase-admin usage (not an
 * installed dependency, and nothing in this app runs server-side Firestore
 * access yet).
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Next.js Fast Refresh re-evaluates this module without a full page reload,
// which would otherwise call connectFirestoreEmulator/connectAuthEmulator
// twice and throw. A global flag survives Fast Refresh (module state doesn't).
const emulatorState = globalThis as unknown as { __plotlensEmulatorConnected?: boolean };

if (process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true" && !emulatorState.__plotlensEmulatorConnected) {
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
  connectAuthEmulator(auth, "http://127.0.0.1:9099");
  emulatorState.__plotlensEmulatorConnected = true;
}
