// lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// 🔥 Configuración de tu proyecto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCbd-IqotK2Gm6RM7rGMbCKucC-3hz9Wog",
  authDomain: "finance-app-8b67c.firebaseapp.com",
  projectId: "finance-app-8b67c",
  storageBucket: "finance-app-8b67c.firebasestorage.app",
  messagingSenderId: "57434903644",
  appId: "1:57434903644:web:51c4a83c9b95fc396e8299"
};

// Inicializamos Firebase
const app = initializeApp(firebaseConfig);

// Exportamos Firestore para usar en toda tu app
export const db = getFirestore(app);
