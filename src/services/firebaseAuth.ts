
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
