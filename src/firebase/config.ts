
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjTkGdjNXAoHNBUCVXpQ3GGOZb7UCmhAo",
  authDomain: "chat-admin-dashboard.firebaseapp.com",
  projectId: "chat-admin-dashboard",
  storageBucket: "chat-admin-dashboard.appspot.com",
  messagingSenderId: "450021819153",
  appId: "1:450021819153:web:b52dc61bd42e07e3f1b02c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
