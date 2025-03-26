
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Enhanced blocked users related functions with better error handling
export const blockUser = async (userId: string, blockedUserId: string) => {
  try {
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    
    // Use a batch write for improved atomicity
    const batch = writeBatch(db);
    
    batch.set(blockRef, {
      blockedAt: serverTimestamp(),
    });
    
    // You could also update the user's preferences in the same batch
    // batch.update(doc(db, 'users', userId), { blockCount: increment(1) });
    
    // Commit the batch
    await batch.commit();
    
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw new Error(`Failed to block user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const unblockUser = async (userId: string, blockedUserId: string) => {
  try {
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    await deleteDoc(blockRef);
    
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw new Error(`Failed to unblock user: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const getBlockedUsers = async () => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const blockedRef = collection(db, 'users', currentUser.uid, 'blockedUsers');
    const snapshot = await getDocs(blockedRef);
    
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error('Error getting blocked users:', error);
    // Return empty array instead of throwing to avoid breaking the UI
    return [];
  }
};
