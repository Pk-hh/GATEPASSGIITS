import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's Production Firebase Configuration (Project: gatepassgiits)
export const firebaseConfig = {
  apiKey: "AIzaSyAs6Jfu-iL1t7xj_PyhmvXeIBi_rwfXx_4",
  authDomain: "gatepassgiits.firebaseapp.com",
  projectId: "gatepassgiits",
  storageBucket: "gatepassgiits.firebasestorage.app",
  messagingSenderId: "59515827881",
  appId: "1:59515827881:web:35baf76bd010885f1d1bb8",
  measurementId: "G-DWKYGCEKXP"
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
