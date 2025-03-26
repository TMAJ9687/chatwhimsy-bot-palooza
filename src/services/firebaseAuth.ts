
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  collection,
  where,
  getDocs
} from 'firebase/firestore';
import { 
  signInAnonymously, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  fetchSignInMethodsForEmail as firebaseFetchSignInMethodsForEmail
} from 'firebase/auth';
import { db, auth } from '@/lib/firebase';

// Get user profile from Firestore
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

// Create a new user profile in Firestore
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

// Update an existing user profile
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

// Sign in anonymously (for guest users with just a nickname)
export const signInAsGuest = async (nickname: string) => {
  try {
    // Create anonymous account
    const { user } = await signInAnonymously(auth);
    
    // Set display name
    await updateProfile(user, { displayName: nickname });
    
    // Create user document with the generated anonymous UID
    await createUserProfile(user.uid, {
      nickname,
      isVip: false,
      imagesRemaining: 15,
      voiceMessagesRemaining: 0,
      blockedUsers: [],
      isAnonymous: true
    });
    
    return user;
  } catch (error) {
    console.error('Error signing in as guest:', error);
    throw error;
  }
};

// Register a new user with email/password (for VIP users)
export const registerUser = async (email: string, password: string, nickname: string) => {
  try {
    // Create user with email/password
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    
    // Set display name
    await updateProfile(user, { displayName: nickname });
    
    // Create user document
    await createUserProfile(user.uid, {
      nickname,
      email: user.email,
      isVip: false,
      imagesRemaining: 15,
      voiceMessagesRemaining: 0,
      blockedUsers: [],
      isAnonymous: false
    });
    
    return user;
  } catch (error) {
    console.error('Error registering user:', error);
    throw error;
  }
};

// Sign in an existing user with email/password
export const signInUser = async (email: string, password: string) => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (error) {
    console.error('Error signing in user:', error);
    throw error;
  }
};

// Check if a user exists by email
export const checkUserExists = async (email: string) => {
  try {
    // Fixed: Using Firebase's fetchSignInMethodsForEmail directly
    const methods = await firebaseFetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return false;
  }
};

// Create test users for development purposes
export const createTestUsers = async () => {
  try {
    // Check if test users already exist
    const testGuestId = "test-guest-user";
    const testVipId = "test-vip-user";
    
    const testGuestRef = doc(db, 'users', testGuestId);
    const testVipRef = doc(db, 'users', testVipId);
    
    const testGuestDoc = await getDoc(testGuestRef);
    const testVipDoc = await getDoc(testVipRef);
    
    const timestamp = serverTimestamp();
    
    // Create test guest user if it doesn't exist
    if (!testGuestDoc.exists()) {
      await setDoc(testGuestRef, {
        nickname: "TestGuest",
        isVip: false,
        isAnonymous: true,
        imagesRemaining: 15,
        voiceMessagesRemaining: 0,
        blockedUsers: [],
        createdAt: timestamp,
        updatedAt: timestamp
      });
      console.log("Created test guest user");
    }
    
    // Create test VIP user if it doesn't exist
    if (!testVipDoc.exists()) {
      await setDoc(testVipRef, {
        nickname: "TestVIP",
        email: "testvip@example.com",
        isVip: true,
        isAnonymous: false,
        imagesRemaining: Infinity,
        voiceMessagesRemaining: Infinity,
        blockedUsers: [],
        gender: "male",
        age: 30,
        country: "United States",
        interests: ["Music", "Travel"],
        createdAt: timestamp,
        updatedAt: timestamp,
        lastSeen: timestamp
      });
      console.log("Created test VIP user");
    }
    
    // Create a test chat
    const testChatId = "test-chat";
    const testChatRef = doc(db, 'chats', testChatId);
    const testChatDoc = await getDoc(testChatRef);
    
    if (!testChatDoc.exists()) {
      await setDoc(testChatRef, {
        participants: [testGuestId, testVipId],
        lastMessage: "Hello, this is a test chat!",
        lastMessageTime: timestamp,
        createdAt: timestamp,
        isActive: true
      });
      
      // Create some test messages
      const messagesRef = collection(db, 'messages');
      
      // Message 1
      await setDoc(doc(messagesRef), {
        chatId: testChatId,
        senderId: testGuestId,
        senderName: "TestGuest",
        text: "Hello, how are you?",
        isRead: true,
        timestamp: timestamp
      });
      
      // Message 2
      await setDoc(doc(messagesRef), {
        chatId: testChatId,
        senderId: testVipId,
        senderName: "TestVIP",
        text: "I'm doing great! How about you?",
        isRead: true,
        timestamp: timestamp
      });
      
      console.log("Created test chat with messages");
    }
    
    // Create a test subscription
    const testSubId = "test-subscription";
    const testSubRef = doc(db, 'subscriptions', testSubId);
    const testSubDoc = await getDoc(testSubRef);
    
    if (!testSubDoc.exists()) {
      // Create end date 1 month from now
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      
      await setDoc(testSubRef, {
        userId: testVipId,
        plan: "monthly",
        startDate: timestamp,
        endDate: endDate,
        status: "active",
        paymentMethod: "credit_card",
        autoRenew: true
      });
      
      console.log("Created test subscription");
    }
    
    return {
      success: true,
      message: "Test users, chat, and subscription successfully created"
    };
  } catch (error) {
    console.error('Error creating test users:', error);
    return {
      success: false,
      message: `Failed to create test users: ${error}`
    };
  }
};

// Initialize all Firebase data - collections and test data
export const initializeFirebaseData = async () => {
  try {
    // First ensure collections exist
    const collections = ['users', 'chats', 'messages', 'subscriptions', 'reports'];
    
    for (const collectionName of collections) {
      const initDocRef = doc(db, collectionName, 'init');
      const docSnap = await getDoc(initDocRef);
      
      if (!docSnap.exists()) {
        await setDoc(initDocRef, {
          initialized: true,
          createdAt: serverTimestamp()
        });
        console.log(`Initialized ${collectionName} collection`);
      }
    }
    
    // Create test users and data
    const testResult = await createTestUsers();
    
    return {
      success: true,
      collections: collections,
      testData: testResult
    };
  } catch (error) {
    console.error('Error initializing Firebase data:', error);
    return {
      success: false,
      error: `Failed to initialize Firebase data: ${error}`
    };
  }
};
