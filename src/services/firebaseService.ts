
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

// Subscription related functions
export const getSubscription = async (userId: string) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    const subscriptionDoc = await getDoc(subscriptionRef);
    
    if (subscriptionDoc.exists()) {
      return { id: subscriptionDoc.id, ...subscriptionDoc.data() };
    } else {
      return { 
        status: 'none',
        plan: 'none',
        endDate: null
      };
    }
  } catch (error) {
    console.error('Error getting subscription:', error);
    return { 
      status: 'none',
      plan: 'none',
      endDate: null
    };
  }
};

export const createSubscription = async (userId: string, plan: string, endDate: Date) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await setDoc(subscriptionRef, {
      userId,
      plan,
      status: 'active',
      startDate: serverTimestamp(),
      endDate,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (userId: string) => {
  try {
    const subscriptionRef = doc(db, 'subscriptions', userId);
    await updateDoc(subscriptionRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
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

// Chat related functions
export const sendMessage = async (senderId: string, receiverId: string, content: string, isImage: boolean = false) => {
  try {
    const chatRef = collection(db, 'chats');
    const messageRef = await addDoc(chatRef, {
      senderId,
      receiverId,
      content,
      isImage,
      status: 'sent',
      timestamp: serverTimestamp(),
    });
    
    return {
      id: messageRef.id,
      senderId,
      receiverId,
      content,
      isImage,
      status: 'sent',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (userId: string, otherId: string) => {
  try {
    const chatRef = collection(db, 'chats');
    
    // Get messages where the current user is either the sender or receiver
    const q = query(
      chatRef, 
      where('senderId', 'in', [userId, otherId]),
      where('receiverId', 'in', [userId, otherId])
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }))
      .sort((a, b) => a.timestamp - b.timestamp);
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
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

// Additional functions
export const reportUser = async (userId: string, reason: string) => {
  try {
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      throw new Error('User not authenticated');
    }
    
    const reportRef = await addDoc(collection(db, 'reports'), {
      reporterId: currentUser.uid,
      reportedUserId: userId,
      reason,
      status: 'pending',
      createdAt: serverTimestamp(),
    });
    
    return reportRef.id;
  } catch (error) {
    console.error('Error reporting user:', error);
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
