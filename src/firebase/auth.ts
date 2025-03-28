
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from './config';

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Check if user is admin
export const isUserAdmin = (user: FirebaseUser | null): boolean => {
  // In a real application, this would check custom claims or roles in Firestore
  // For demo purposes, we'll just check email
  return !!user && user.email === 'admin@example.com';
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// For demo purposes - this simulates verifying admin credentials
// In a real app, this would be handled by Firebase Authentication
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    // This will throw if credentials are invalid
    await signInWithEmail(email, password);
    return true;
  } catch (error) {
    console.error('Authentication error:', error);
    return false;
  }
};
