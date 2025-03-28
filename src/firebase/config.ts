
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDY2ahen-rFA985JMwNXa_k9tS5Y9DYhIg",
  authDomain: "chatwiilovable.firebaseapp.com",
  projectId: "chatwiilovable",
  storageBucket: "chatwiilovable.firebasestorage.app", 
  messagingSenderId: "760246107454",
  appId: "1:760246107454:web:a09ef90265dfa0c57f806f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
