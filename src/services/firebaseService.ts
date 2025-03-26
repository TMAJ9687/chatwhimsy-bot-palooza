
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  serverTimestamp, 
  addDoc 
} from 'firebase/firestore';
import { db, auth, storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';

// User related functions
export const getUserProfile = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

export const createUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      ...userData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...userData,
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

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

// Blocked users related functions
export const blockUser = async (blockedUserId: string) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const blockRef = doc(db, 'users', currentUser.uid, 'blockedUsers', blockedUserId);
    await setDoc(blockRef, {
      blockedAt: serverTimestamp(),
    });
    
    return true;
  } catch (error) {
    console.error('Error blocking user:', error);
    throw error;
  }
};

export const unblockUser = async (blockedUserId: string) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const blockRef = doc(db, 'users', currentUser.uid, 'blockedUsers', blockedUserId);
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
    throw error;
  }
};

// Image upload function
export const uploadImage = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
