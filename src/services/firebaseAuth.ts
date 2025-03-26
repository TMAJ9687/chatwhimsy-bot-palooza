
import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, usersCollection } from '../lib/firebase';

// Get user profile from Firestore
export const getUserProfile = async (userId: string) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return userDoc.data();
    } else {
      console.log("User document does not exist");
      return null;
    }
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

// Create a new user profile in Firestore
export const createUserProfile = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Create new user document with default values
      await setDoc(userDocRef, {
        nickname: data.nickname || 'User',
        email: data.email || null,
        isVip: data.isVip || false,
        isAnonymous: data.isAnonymous || true,
        gender: data.gender || null,
        age: data.age || null,
        country: data.country || null,
        interests: data.interests || [],
        imagesRemaining: data.isVip ? Infinity : 15,
        voiceMessagesRemaining: data.isVip ? Infinity : 0,
        blockedUsers: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastSeen: serverTimestamp()
      });
      console.log("User profile created successfully");
      return true;
    } else {
      console.log("User document already exists, updating instead");
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      return true;
    }
  } catch (error) {
    console.error("Error creating user profile:", error);
    return false;
  }
};

// Update an existing user profile
export const updateUserProfile = async (userId: string, data: any) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      // Document doesn't exist, create it first
      console.log("User document doesn't exist, creating it first");
      return await createUserProfile(userId, data);
    }
    
    // Update the existing document
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
    
    console.log("User profile updated successfully");
    return true;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Sign in as guest (anonymous)
export const signInAsGuest = async (nickname: string) => {
  try {
    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    // Update the user profile with the nickname
    await updateProfile(user, {
      displayName: nickname
    });
    
    // Create a user document in Firestore
    await createUserProfile(user.uid, {
      nickname,
      isAnonymous: true,
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Error signing in as guest:", error);
    throw error;
  }
};

// Register a new user with email and password
export const registerUser = async (email: string, password: string, nickname: string) => {
  try {
    // Create the user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update the user profile with the nickname
    await updateProfile(user, {
      displayName: nickname
    });
    
    // Create a user document in Firestore
    await createUserProfile(user.uid, {
      nickname,
      email,
      isAnonymous: false,
      createdAt: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

// Sign in with email and password
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last seen
    await updateUserProfile(user.uid, {
      lastSeen: serverTimestamp()
    });
    
    return user;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};
