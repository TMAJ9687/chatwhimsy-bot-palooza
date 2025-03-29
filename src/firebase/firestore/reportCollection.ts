
import { 
  collection, 
  doc, 
  setDoc, 
  getDocs,
  updateDoc,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config';
import { ReportFeedback } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { dateToTimestamp } from './utils';
import { 
  getDocumentsFromCollection, 
  deleteDocument,
  convertTimestampFields
} from './dbUtils';

// Collection name
export const REPORTS_COLLECTION = 'reports';

// Report and Feedback Management
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    // Clean up expired items first
    await cleanupExpiredReportsFeedback();
    
    return await getDocumentsFromCollection<ReportFeedback>(
      REPORTS_COLLECTION,
      (doc) => convertTimestampFields<ReportFeedback>(doc, ['timestamp', 'expiresAt'])
    );
  } catch (error) {
    console.error('Error getting reports and feedback:', error);
    return []; // Return empty array as fallback
  }
};

export const addReportOrFeedback = async (
  type: 'report' | 'feedback', 
  userId: string, 
  content: string
): Promise<ReportFeedback> => {
  try {
    // Create timestamp for now
    const now = new Date();
    
    // Create expiry date (24 hours from now)
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const item: ReportFeedback = {
      id: uuidv4(),
      type,
      userId,
      content,
      timestamp: now,
      expiresAt,
      resolved: false
    };
    
    // Convert dates to Firestore timestamps
    const firestoreItem = {
      ...item,
      timestamp: dateToTimestamp(now),
      expiresAt: dateToTimestamp(expiresAt)
    };
    
    await setDoc(doc(db, REPORTS_COLLECTION, item.id), firestoreItem);
    
    return item;
  } catch (error) {
    console.error('Error adding report or feedback:', error);
    throw new Error('Failed to add report or feedback');
  }
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  try {
    const docRef = doc(db, REPORTS_COLLECTION, id);
    const docSnapshot = await db.getDoc(docRef);
    
    if (!docSnapshot.exists()) return false;
    
    await updateDoc(docRef, { resolved: true });
    return true;
  } catch (error) {
    console.error('Error resolving report or feedback:', error);
    return false;
  }
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  return await deleteDocument(REPORTS_COLLECTION, id);
};

export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  try {
    const now = new Date();
    const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    
    const deletePromises = reportsSnapshot.docs
      .filter(doc => {
        const data = doc.data();
        if (!data.expiresAt) return false;
        
        const expiryDate = data.expiresAt instanceof Timestamp 
          ? data.expiresAt.toDate() 
          : new Date(data.expiresAt);
          
        return expiryDate < now;
      })
      .map(doc => deleteDocument(REPORTS_COLLECTION, doc.id));
    
    await Promise.all(deletePromises);
  } catch (error) {
    console.error('Error cleaning up expired reports and feedback:', error);
  }
};
