// src/Config/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import {getFirestore} from 'firebase/firestore';

// Configuración del proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDsTCZYTkhprPKmXXtiqYwnO0ty2XoTggI",
  authDomain: "clontwitter-a0396.firebaseapp.com",
  projectId: "clontwitter-a0396",
  storageBucket: "clontwitter-a0396.firebasestorage.app",
  messagingSenderId: "153825242281",
  appId: "1:153825242281:web:6249ee5f7d60cf67208db8"
};

// Inicializar la app Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

export default app;
