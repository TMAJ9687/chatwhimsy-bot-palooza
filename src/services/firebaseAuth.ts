
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
    throw error; // Throw the error to be caught by the caller
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
    if (!nickname || nickname.trim() === '') {
      throw new Error("Nickname cannot be empty");
    }
    
    console.log("Signing in anonymously with nickname:", nickname);
    
    // Sign in anonymously
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    console.log("Anonymous sign-in successful, user ID:", user.uid);
    
    // Update the user profile with the nickname
    await updateProfile(user, {
      displayName: nickname
    });
    
    console.log("User profile updated with nickname");
    
    // Create a user document in Firestore
    await createUserProfile(user.uid, {
      nickname,
      isAnonymous: true,
      createdAt: serverTimestamp()
    });
    
    console.log("User profile created in Firestore");
    
    return user;
  } catch (error) {
    console.error("Error signing in as guest:", error);
    throw error;
  }
};

// Register a new user with email and password
export const registerUser = async (email: string, password: string, nickname: string) => {
  try {
    if (!nickname || nickname.trim() === '') {
      throw new Error("Nickname cannot be empty");
    }
    
    if (!email || email.trim() === '') {
      throw new Error("Email cannot be empty");
    }
    
    if (!password || password.length < 6) {
      throw new Error("Password must be at least 6 characters");
    }
    
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
  } catch (error: any) {
    console.error("Error registering user:", error);
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("This email is already registered. Try signing in instead.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Please enter a valid email address.");
    } else if (error.code === 'auth/weak-password') {
      throw new Error("Password is too weak. Please choose a stronger password.");
    }
    
    throw error;
  }
};

// Sign in with email and password
export const signInUser = async (email: string, password: string) => {
  try {
    if (!email || email.trim() === '') {
      throw new Error("Email cannot be empty");
    }
    
    if (!password) {
      throw new Error("Password cannot be empty");
    }
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last seen
    await updateUserProfile(user.uid, {
      lastSeen: serverTimestamp()
    });
    
    return user;
  } catch (error: any) {
    console.error("Error signing in user:", error);
    
    // Provide more user-friendly error messages
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw new Error("Invalid email or password. Please try again.");
    } else if (error.code === 'auth/invalid-email') {
      throw new Error("Please enter a valid email address.");
    } else if (error.code === 'auth/user-disabled') {
      throw new Error("Your account has been disabled. Please contact support.");
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error("Too many unsuccessful login attempts. Please try again later.");
    }
    
    throw error;
  }
};
