
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config';
import { ReportFeedback } from '@/types/admin';
import { v4 as uuidv4 } from 'uuid';
import { timestampToDate, dateToTimestamp } from './utils';

// Collection name
const REPORTS_COLLECTION = 'reports';

// Report and Feedback Management
export const getReportsAndFeedback = async (): Promise<ReportFeedback[]> => {
  try {
    // Clean up expired items first
    await cleanupExpiredReportsFeedback();
    
    const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
    return reportsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        timestamp: data.timestamp ? timestampToDate(data.timestamp as Timestamp) : new Date(),
        expiresAt: data.expiresAt ? timestampToDate(data.expiresAt as Timestamp) : new Date(Date.now() + 86400000),
        id: doc.id
      } as ReportFeedback;
    });
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
};

export const resolveReportOrFeedback = async (id: string): Promise<boolean> => {
  const reportRef = doc(db, REPORTS_COLLECTION, id);
  const reportDoc = await getDoc(reportRef);
  
  if (!reportDoc.exists()) return false;
  
  await updateDoc(reportRef, { resolved: true });
  return true;
};

export const deleteReportOrFeedback = async (id: string): Promise<boolean> => {
  const reportRef = doc(db, REPORTS_COLLECTION, id);
  const reportDoc = await getDoc(reportRef);
  
  if (!reportDoc.exists()) return false;
  
  await deleteDoc(reportRef);
  return true;
};

export const cleanupExpiredReportsFeedback = async (): Promise<void> => {
  const now = new Date();
  const reportsSnapshot = await getDocs(collection(db, REPORTS_COLLECTION));
  
  const deletePromises = reportsSnapshot.docs
    .filter(doc => {
      const data = doc.data();
      const expiryDate = timestampToDate(data.expiresAt as Timestamp);
      return expiryDate < now;
    })
    .map(doc => deleteDoc(doc.ref));
  
  await Promise.all(deletePromises);
};
