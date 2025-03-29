
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

// Initialize Firebase with error handling
let app;
let db;
let auth;
let storage;
let firestoreAvailable = true;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  firestoreAvailable = false;
  
  // Create dummy implementations for fallback
  app = {} as any;
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
}

export { auth, db, storage, firestoreAvailable };
export default app;
