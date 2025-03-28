
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

// Enhanced sign out with better cleanup
export const signOutUser = async (): Promise<void> => {
  try {
    console.log('Firebase signOut started');
    
    // Clean up any UI elements that might cause issues during navigation
    try {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
      
      // Remove any overlay elements to avoid DOM errors
      const overlaySelectors = [
        '.fixed.inset-0',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]'
      ];
      
      overlaySelectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(el => {
            try {
              if (el.parentNode && document.contains(el) && 
                  Array.from(el.parentNode.childNodes).includes(el)) {
                el.remove();
              }
            } catch (err) {
              // Ignore errors during emergency cleanup
            }
          });
        } catch (err) {
          // Ignore errors
        }
      });
    } catch (err) {
      // Ignore any DOM errors during cleanup
    }
    
    // Now perform the actual signOut operation
    await signOut(auth);
    console.log('Firebase signOut completed successfully');
  } catch (error) {
    console.error('Firebase signOut error:', error);
    throw error;
  }
};

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

// Check if user is admin
export const isUserAdmin = (user: FirebaseUser | null): boolean => {
  // In a real application, you would check custom claims or roles in Firestore
  if (!user) return false;
  
  // For demo purposes, consider these emails as admin
  const adminEmails = ['admin@example.com', 'your-email@example.com', 'user@example.com'];
  return adminEmails.includes(user.email || '');
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void): (() => void) => {
  return onAuthStateChanged(auth, callback);
};

// For demo purposes - this simulates verifying admin credentials
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  try {
    // This will throw if credentials are invalid
    await signInWithEmail(email, password);
    
    // Check if email is in the admin list
    const isAdmin = isUserAdmin({email} as any);
    
    return isAdmin;
  } catch (error) {
    console.error('Authentication error:', error);
    
    // For demo - allow a hardcoded admin login
    if (email === 'admin@example.com' && password === 'admin123') {
      return true;
    }
    
    return false;
  }
};
