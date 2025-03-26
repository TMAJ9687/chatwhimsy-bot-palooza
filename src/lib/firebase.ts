
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC1WWCjmGMDi3sozEQ4NPMEmV24y9Png8k",
  authDomain: "chatwii-54dbe.firebaseapp.com",
  projectId: "chatwii-54dbe",
  storageBucket: "chatwii-54dbe.appspot.com",
  messagingSenderId: "1099388582891",
  appId: "1:1099388582891:web:8628d78bf8ed63d768b7ae",
  measurementId: "G-FXZTQ7Y1GT",
  databaseURL: "https://chatwii-54dbe-default-rtdb.europe-west1.firebasedatabase.app"
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
export const messagesCollection = collection(db, 'messages');
export const subscriptionsCollection = collection(db, 'subscriptions');
export const reportsCollection = collection(db, 'reports');

// Schema definitions for collections (for reference)
export const collectionSchemas = {
  users: {
    nickname: 'string',
    email: 'string?',
    isVip: 'boolean',
    isAnonymous: 'boolean',
    gender: 'string?',
    age: 'number?',
    country: 'string?',
    interests: 'array?',
    imagesRemaining: 'number',
    voiceMessagesRemaining: 'number',
    blockedUsers: 'array',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
    lastSeen: 'timestamp?',
    avatarId: 'string?'
  },
  chats: {
    participants: 'array',
    lastMessage: 'string?',
    lastMessageTime: 'timestamp?',
    createdAt: 'timestamp',
    isActive: 'boolean'
  },
  messages: {
    chatId: 'string', 
    senderId: 'string',
    senderName: 'string',
    text: 'string?',
    imageUrl: 'string?',
    voiceUrl: 'string?',
    isRead: 'boolean',
    timestamp: 'timestamp'
  },
  subscriptions: {
    userId: 'string',
    plan: 'string', // 'monthly', 'semiannual', 'annual'
    startDate: 'timestamp',
    endDate: 'timestamp',
    status: 'string', // 'active', 'cancelled', 'expired'
    paymentMethod: 'string?',
    autoRenew: 'boolean'
  },
  reports: {
    reporterId: 'string',
    reportedUserId: 'string',
    reason: 'string',
    details: 'string?',
    timestamp: 'timestamp',
    status: 'string' // 'pending', 'reviewed', 'resolved'
  }
};

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
    ensureCollectionExists('messages'),
    ensureCollectionExists('subscriptions'),
    ensureCollectionExists('reports')
  ]);
  console.log('Firestore collections initialized');
};

export default app;
