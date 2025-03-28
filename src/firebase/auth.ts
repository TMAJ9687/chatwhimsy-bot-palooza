
import { 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from './config';

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    console.error("Firebase signIn error:", error.code, error.message);
    throw error;
  }
};

// Create a new user with email and password
export const createUserWithEmail = async (email: string, password: string): Promise<FirebaseUser> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<void> => {
  await sendPasswordResetEmail(auth, email);
};

// Sign out
export const signOutUser = async (): Promise<void> => {
  await signOut(auth);
  // Also clear local storage items related to admin session
  localStorage.removeItem('adminData');
  localStorage.removeItem('adminEmail');
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Check if user is admin
export const isUserAdmin = (user: FirebaseUser | null): boolean => {
  // In a real application, you would check custom claims or roles in Firestore
  if (!user) return false;
  
  // For demo purposes, we'll consider any user with these emails as admin
  const adminEmails = ['admin@example.com', 'your-email@example.com'];
  return adminEmails.includes(user.email || '');
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
    
    // For demo - allow a hardcoded admin login
    if (email === 'admin@example.com' && password === 'admin123') {
      return true;
    }
    
    return false;
  }
};
