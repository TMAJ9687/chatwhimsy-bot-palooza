
import { 
  collection, 
  getDocs, 
  Timestamp 
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
      // Import on demand to avoid circular dependencies
      const { setDoc, doc } = await import('firebase/firestore');
      
      const promises = botProfiles.map(bot => setDoc(doc(db, 'bots', bot.id), bot));
      await Promise.all(promises);
      console.log('Firestore initialized with default bot data');
    }
  } catch (error) {
    console.error('Error initializing Firestore data:', error);
    throw error;
  }
};
