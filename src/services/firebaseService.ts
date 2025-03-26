import { db, rtdb, storage } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import { ref, get, set, update, push, remove } from 'firebase/database';
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

// User related functions
export const getUserProfile = async (userId: string) => {
  const docRef = doc(db, 'users', userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const updateUserProfile = async (userId: string, data: any) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, {
    ...data,
    updatedAt: serverTimestamp()
  });
};

// Chat related functions
export const sendMessage = async (chatId: string, message: any) => {
  const chatRef = ref(rtdb, `chats/${chatId}/messages`);
  const newMessageRef = push(chatRef);
  return set(newMessageRef, {
    ...message,
    timestamp: Date.now()
  });
};

export const getChatMessages = async (chatId: string) => {
  const chatRef = ref(rtdb, `chats/${chatId}/messages`);
  const snapshot = await get(chatRef);
  if (snapshot.exists()) {
    return Object.entries(snapshot.val()).map(([id, message]) => ({
      id,
      ...message
    }));
  }
  return [];
};

export const subscribeToChat = (chatId: string, callback: (messages: any[]) => void) => {
  // This would use onValue from Firebase but we're keeping it simple
  // This is a placeholder for real-time subscription
  console.log(`Subscribing to chat ${chatId}`);
  return () => console.log(`Unsubscribing from chat ${chatId}`);
};

// Blocking functions
export const blockUser = async (userId: string, blockedUserId: string) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, {
    blockedUsers: arrayUnion(blockedUserId)
  });
};

export const unblockUser = async (userId: string, blockedUserId: string) => {
  const userRef = doc(db, 'users', userId);
  return updateDoc(userRef, {
    blockedUsers: arrayRemove(blockedUserId)
  });
};

export const getBlockedUsers = async (userId: string) => {
  const userDoc = await getDoc(doc(db, 'users', userId));
  if (userDoc.exists()) {
    return userDoc.data().blockedUsers || [];
  }
  return [];
};

// Reporting functions
export const reportUser = async (reporterId: string, reportedUserId: string, reason: string, details?: string) => {
  const reportsRef = collection(db, 'reports');
  const newReportRef = doc(reportsRef);
  return setDoc(newReportRef, {
    reporterId,
    reportedUserId,
    reason,
    details,
    status: 'pending',
    createdAt: serverTimestamp()
  });
};

// Image upload functions
export const uploadImage = async (userId: string, file: File, chatId?: string) => {
  const imageRef = storageRef(storage, `images/${userId}/${Date.now()}_${file.name}`);
  const snapshot = await uploadBytes(imageRef, file);
  const downloadURL = await getDownloadURL(snapshot.ref);
  
  // Update user's image count in Firestore if not VIP
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (userDoc.exists() && !userDoc.data().isVip) {
    await updateDoc(userRef, {
      imagesRemaining: Math.max(0, (userDoc.data().imagesRemaining || 15) - 1)
    });
  }
  
  return downloadURL;
};

// Subscription related functions
export const createSubscription = async (userId: string, plan: string, endDate: Date) => {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  return setDoc(subscriptionRef, {
    userId,
    plan,
    startDate: serverTimestamp(),
    endDate,
    status: 'active',
    features: {
      unlimitedImages: true,
      voiceMessages: true,
      readReceipts: true
    }
  });
};

export const getSubscription = async (userId: string) => {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  const docSnap = await getDoc(subscriptionRef);
  return docSnap.exists() ? docSnap.data() : null;
};

export const cancelSubscription = async (userId: string) => {
  const subscriptionRef = doc(db, 'subscriptions', userId);
  return updateDoc(subscriptionRef, {
    status: 'cancelled',
    cancelledAt: serverTimestamp()
  });
};
