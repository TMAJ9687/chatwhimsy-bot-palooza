
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
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

// Initialize Firebase with enhanced error handling
let app;
let db;
let auth;
let storage;
let firestoreAvailable = true;
let firestoreBlocked = false;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Try to enable offline persistence for Firestore
  try {
    enableIndexedDbPersistence(db).catch((err) => {
      if (err.code === 'failed-precondition') {
        // Multiple tabs open, persistence can only be enabled in one tab at a time
        console.warn('Firestore persistence failed: Multiple tabs open');
      } else if (err.code === 'unimplemented') {
        // The current browser does not support persistence
        console.warn('Firestore persistence not supported by browser');
      }
    });
  } catch (persistenceError) {
    console.warn('Error enabling Firestore persistence:', persistenceError);
  }
  
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  firestoreAvailable = false;
  
  // Check if the error is likely due to being blocked
  if (error?.message?.includes('fetch') || error?.message?.includes('network') || 
      error?.message?.includes('blocked') || error?.name === 'TypeError') {
    firestoreBlocked = true;
    // Save blocked state to session storage so other components can detect it
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('firestoreBlocked', 'true');
      sessionStorage.setItem('firestoreErrors', '1');
    }
    console.warn('Firebase appears to be blocked by browser extension or network issue');
  }
  
  // Create dummy implementations for fallback
  app = {} as any;
  auth = {} as any;
  db = {} as any;
  storage = {} as any;
}

// Detect if connection was blocked
const detectFirestoreBlock = () => {
  // Check for browser extensions that commonly block Firebase
  const hasAdBlocker = () => {
    try {
      // Look for common ad blocker variables
      const test = document.createElement('div');
      test.innerHTML = '&nbsp;';
      test.className = 'adsbox';
      document.body.appendChild(test);
      const blocked = test.offsetHeight === 0;
      document.body.removeChild(test);
      return blocked;
    } catch (e) {
      return false;
    }
  };
  
  if (hasAdBlocker()) {
    console.warn('Ad blocker detected, may interfere with Firebase connections');
    sessionStorage.setItem('adBlockerDetected', 'true');
  }
  
  return firestoreBlocked;
};

export { auth, db, storage, firestoreAvailable, firestoreBlocked, detectFirestoreBlock };
export default app;
