
import { 
  collection, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Report related functions
export const submitReport = async (reportData: any) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const reportRef = await addDoc(collection(db, 'reports'), {
      ...reportData,
      reporterId: currentUser.uid,
      reporterEmail: currentUser.email,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    return reportRef.id;
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

export const reportUser = async (reporterId: string, reportedUserId: string, reason: string, details?: string) => {
  try {
    const reportRef = await addDoc(collection(db, 'reports'), {
      reporterId,
      reportedUserId,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    return reportRef.id;
  } catch (error) {
    console.error('Error reporting user:', error);
    throw error;
  }
};
