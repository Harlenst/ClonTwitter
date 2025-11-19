// src/Config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAeQFYDNMg7u5F8uFKsZes30q7LFj5xLk8",
  authDomain: "clon-twitter-8f663.firebaseapp.com",
  projectId: "clon-twitter-8f663",
  storageBucket: "clon-twitter-8f663.firebasestorage.app",
  messagingSenderId: "464315032792",
  appId: "1:464315032792:web:661472f05d7841334723ad"
};

export const app = initializeApp(firebaseConfig);

// IMPORTANTE: initializeFirestore optimizado para React Native
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // Ayuda con problemas de conexión en Android
});

export default app;