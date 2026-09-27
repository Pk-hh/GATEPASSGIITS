import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's Production Firebase Configuration (Project: gatepassgiits)
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAs6Jfu-iL1t7xj_PyhmvXeIBi_rwfXx_4",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gatepassgiits.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gatepassgiits",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gatepassgiits.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "59515827881",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:59515827881:web:35baf76bd010885f1d1bb8",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DWKYGCEKXP"
};

export const getActiveFirebaseConfig = () => firebaseConfig;

// Initialize Firebase App instance
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(e => {
    console.warn("Analytics not supported in this environment:", e);
  });
}

export { app, auth, db, analytics };
