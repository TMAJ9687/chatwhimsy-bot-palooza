
import { 
  collection, 
  addDoc, 
  serverTimestamp,
  writeBatch,
  doc 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Enhanced report related functions with better error handling
export const submitReport = async (reportData: any) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    // Add validation for required fields
    if (!reportData.reason) {
      throw new Error('Report reason is required');
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
    throw new Error(`Failed to submit report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const reportUser = async (reporterId: string, reportedUserId: string, reason: string, details?: string) => {
  try {
    // Validate required parameters
    if (!reporterId) throw new Error('Reporter ID is required');
    if (!reportedUserId) throw new Error('Reported user ID is required');
    if (!reason) throw new Error('Report reason is required');
    
    // Optionally use a batch for more complex report scenarios
    const batch = writeBatch(db);
    
    // Create the report document
    const reportsCol = collection(db, 'reports');
    const newReportRef = doc(reportsCol);
    
    batch.set(newReportRef, {
      reporterId,
      reportedUserId,
      reason,
      details: details || '',
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    // Optionally track reports in user's profile
    // batch.update(doc(db, 'users', reportedUserId), { reportCount: increment(1) });
    
    // Commit the batch
    await batch.commit();
    
    return newReportRef.id;
  } catch (error) {
    console.error('Error reporting user:', error);
    throw new Error(`Failed to report user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
