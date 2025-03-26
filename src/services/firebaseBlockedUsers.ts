
import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

// Blocked users related functions
export const blockUser = async (userId: string, blockedUserId: string) => {
  try {
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    await setDoc(blockRef, {
      blockedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

export const unblockUser = async (userId: string, blockedUserId: string) => {
  try {
    const blockRef = doc(db, 'users', userId, 'blockedUsers', blockedUserId);
    await deleteDoc(blockRef);
    
    return true;
  } catch (error) {
    console.error('Error unblocking user:', error);
    throw error;
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
    return [];
  }
};
