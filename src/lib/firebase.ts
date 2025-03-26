
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
// Replace these with your actual Firebase config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "your-app.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "your-app",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "your-app.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "your-app-id",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://your-app-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const rtdb = getDatabase(app);

// Collection references
export const usersCollection = collection(db, 'users');
export const chatsCollection = collection(db, 'chats');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const reportsCollection = collection(db, 'reports');

// Helper function to check if a collection exists and create it if it doesn't
export const ensureCollectionExists = async (collectionName: string) => {
  try {
    // Try to get a document from the collection
    const docRef = doc(db, collectionName, 'init');
    const docSnap = await getDoc(docRef);
    
    // If the document doesn't exist, create it
    if (!docSnap.exists()) {
      await setDoc(docRef, {
        initialized: true,
        createdAt: serverTimestamp()
      });
      console.log(`Initialized ${collectionName} collection`);
    }
  } catch (error) {
    console.error(`Error ensuring ${collectionName} collection exists:`, error);
  }
};

// Initialize essential collections if they don't exist
export const initializeFirestore = async () => {
  await Promise.all([
    ensureCollectionExists('users'),
    ensureCollectionExists('chats'),
    ensureCollectionExists('subscriptions'),
    ensureCollectionExists('reports')
  ]);
  console.log('Firestore collections initialized');
};

export default app;
