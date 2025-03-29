
import { 
  collection, 
  getDocs, 
  Timestamp,
  setDoc,
  doc
} from 'firebase/firestore';
import { db } from '../config';
import { botProfiles } from '@/data/botProfiles';

// Convert Firestore timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Convert Date to Firestore timestamp
export const dateToTimestamp = (date: Date): Timestamp => {
  return Timestamp.fromDate(date);
};

// Initialize the database with default data
export const initializeFirestoreData = async (): Promise<void> => {
  try {
    // Check if bots collection is already populated
    const botsSnapshot = await getDocs(collection(db, 'bots'));
    
    // If bots collection is empty, populate with default bots
    if (botsSnapshot.empty) {
      const promises = botProfiles.map(bot => setDoc(doc(db, 'bots', bot.id), bot));
      await Promise.all(promises);
      console.log('Firestore initialized with default bot data');
    }
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
    throw error;
  }
};

// Ensure the required collections exist
export const ensureCollectionsExist = async (): Promise<void> => {
  try {
    // Check if users collection exists and create if not
    const usersSnapshot = await getDocs(collection(db, 'users'));
    if (usersSnapshot.empty) {
      console.log('Users collection is empty, creating sample user');
      // Create a sample admin user to ensure the collection exists
      await setDoc(doc(db, 'users', 'admin'), {
        id: 'admin',
        nickname: 'Admin',
        email: 'admin@example.com',
        isAdmin: true,
        isVip: true,
        gender: 'male',
        age: 30,
        country: 'US',
        interests: ['technology'],
        subscriptionTier: 'annual',
        imagesRemaining: Infinity,
        voiceMessagesRemaining: Infinity
      });
    }
  } catch (error) {
    console.error('Error ensuring collections exist:', error);
  }
};
