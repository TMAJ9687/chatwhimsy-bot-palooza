
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
  signInAnonymously as firebaseSignInAnonymously,
  User
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  addDoc,
  collection
} from 'firebase/firestore';
import { ref, set } from 'firebase/database';
import { auth, db, rtdb, initializeFirestore } from '@/lib/firebase';

// Function to create a user profile in Firestore
export const createUserProfile = async (userId: string, nickname: string, email?: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      nickname: nickname,
      email: email || null,
      isVip: false,
      isAnonymous: !email,
      imagesRemaining: 15,
      voiceMessagesRemaining: 5,
      blockedUsers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    console.log(`User profile created for user ${userId}`);
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

// Function to get a user profile from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const docSnap = await getDoc(userRef);
    
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("No such document!");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    throw error;
  }
};

// Function to update a user profile in Firestore
export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    console.log(`User profile updated for user ${userId}`);
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Sign up a user with email and password
export const registerUser = async (email: string, password: string, nickname: string): Promise<User | null> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: nickname });
    
    // Create a user profile in Firestore
    await createUserProfile(user.uid, nickname, email);
    
    return user;
  } catch (error: any) {
    console.error("Error signing up:", error);
    throw error;
  }
};

// Sign in a user with email and password
export const signInUser = async (email: string, password: string): Promise<User | null> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Error signing in:", error);
    throw error;
  }
};

// Sign in as a guest with a nickname
export const signInAsGuest = async (nickname: string): Promise<User | null> => {
  try {
    const userCredential = await firebaseSignInAnonymously(auth);
    const user = userCredential.user;
    
    // Update the user's display name
    await updateProfile(user, { displayName: nickname });
    
    // Create a user profile in Firestore
    await createUserProfile(user.uid, nickname);
    
    return user;
  } catch (error: any) {
    console.error("Error signing in as guest:", error);
    throw error;
  }
};

// Firebase Database Initialization
export const initializeFirebaseData = async () => {
  try {
    // First ensure the user is authenticated
    if (!auth.currentUser) {
      throw new Error('Authentication required. Please sign in first.');
    }
    
    // Initialize the required collections in Firestore
    await initializeFirestore();
    
    // Create test user data
    const testGuestUser = {
      nickname: "TestGuest",
      isVip: false,
      isAnonymous: true,
      imagesRemaining: 15,
      voiceMessagesRemaining: 5,
      blockedUsers: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const testVipUser = {
      nickname: "TestVip",
      email: "testvip@example.com",
      isVip: true,
      isAnonymous: false,
      gender: "male",
      age: 30,
      country: "United States",
      interests: ["travel", "music", "sports"],
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity,
      blockedUsers: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSeen: new Date()
    };
    
    // Add users to the database
    const guestRef = doc(db, 'users', 'testguest123');
    const vipRef = doc(db, 'users', 'testvip123');
    
    await setDoc(guestRef, testGuestUser);
    await setDoc(vipRef, testVipUser);
    
    // Create a test chat
    const chatId = 'testchat123';
    const chatRef = doc(db, 'chats', chatId);
    
    await setDoc(chatRef, {
      participants: ['testguest123', 'testvip123'],
      lastMessage: 'Hello there!',
      lastMessageTime: new Date(),
      createdAt: new Date(),
      isActive: true
    });
    
    // Add some test messages
    const messagesCollection = collection(db, 'messages');
    
    await addDoc(messagesCollection, {
      chatId,
      senderId: 'testguest123',
      senderName: 'TestGuest',
      text: 'Hello, how are you?',
      isRead: true,
      timestamp: new Date(Date.now() - 3600000) // 1 hour ago
    });
    
    await addDoc(messagesCollection, {
      chatId,
      senderId: 'testvip123',
      senderName: 'TestVip',
      text: 'I am doing great! How about you?',
      isRead: true,
      timestamp: new Date(Date.now() - 1800000) // 30 minutes ago
    });
    
    // Create a test subscription
    const subscriptionRef = doc(db, 'subscriptions', 'testvip123');
    
    await setDoc(subscriptionRef, {
      userId: 'testvip123',
      plan: 'monthly',
      startDate: new Date(Date.now() - 86400000 * 15), // 15 days ago
      endDate: new Date(Date.now() + 86400000 * 15), // 15 days from now
      status: 'active',
      paymentMethod: 'credit_card',
      autoRenew: true
    });
    
    // Create test data in RTDB for online status
    const rtdbRef = ref(rtdb, 'status');
    await set(rtdbRef, {
      'testguest123': {
        online: true,
        lastSeen: new Date().toISOString()
      },
      'testvip123': {
        online: true,
        lastSeen: new Date().toISOString()
      }
    });
    
    return {
      success: true,
      collections: ['users', 'chats', 'messages', 'subscriptions'],
      testData: {
        message: 'Created test users, chat, messages, and subscription'
      }
    };
  } catch (error) {
    console.error('Failed to initialize Firebase data:', error);
    return {
      success: false,
      error: `Failed to initialize Firebase data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};
