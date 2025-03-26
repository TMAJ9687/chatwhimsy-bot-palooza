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
export interface ChatMessage {
  id?: string;
  senderId?: string;
  receiverId?: string;
  content?: string;
  sender?: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
  timestamp?: Date | number;
}

export const sendMessage = async (chatId: string, messageData: {
  content: string;
  sender: 'user' | 'bot' | 'system';
  isImage?: boolean;
  status?: string;
}) => {
  try {
    const chatRef = collection(db, 'chats');
    const messageRef = await addDoc(chatRef, {
      chatId,
      content: messageData.content,
      sender: messageData.sender,
      isImage: messageData.isImage || false,
      status: messageData.status || 'sent',
      timestamp: serverTimestamp(),
    });
    
    return {
      id: messageRef.id,
      chatId,
      content: messageData.content,
      sender: messageData.sender,
      isImage: messageData.isImage || false,
      status: messageData.status || 'sent',
      timestamp: new Date(),
    };
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

export const getChatMessages = async (chatId: string): Promise<ChatMessage[]> => {
  try {
    const chatRef = collection(db, 'chats');
    
    // Get messages where the chatId matches
    const q = query(
      chatRef, 
      where('chatId', '==', chatId)
    );
    
    const snapshot = await getDocs(q);
    
    return snapshot.docs
      .map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }))
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : Number(a.timestamp) || 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : Number(b.timestamp) || 0;
        return aTime - bTime;
      });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return [];
  }
};

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

// Additional functions
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

// Image upload function
export const uploadImage = async (userId: string, file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, `${userId}/${path}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};
