
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

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
