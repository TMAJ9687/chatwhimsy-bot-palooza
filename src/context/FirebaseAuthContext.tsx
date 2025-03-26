
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile as firebaseUpdateProfile,
  sendPasswordResetEmail,
  deleteUser as firebaseDeleteUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';

// Import both real and mock services
import * as FirebaseService from '@/services/firebaseAuth';
import * as MockService from '@/services/mockFirebaseAuth';

// Flag to control whether to use mock services
const USE_MOCK_SERVICES = true;

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  isAdmin: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithNickname: (nickname: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  convertAnonymousAccount: (email: string, password: string) => Promise<void>;
  // For testing - switch between users
  switchToUserRole?: (role: 'admin' | 'vip' | 'regular' | 'guest') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { toast } = useToast();

  // Initialize user on first load
  useEffect(() => {
    if (USE_MOCK_SERVICES) {
      // Set the current mock user
      const mockUser = MockService.getCurrentUser();
      setCurrentUser(mockUser);
      setIsAnonymous(mockUser?.isAnonymous || false);
      setIsAdmin(mockUser?.isAdmin || false);
      setIsLoading(false);
      console.log("Using mock authentication service");
    } else {
      // Use real Firebase auth
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        
        if (user) {
          setIsAnonymous(user.isAnonymous || false);
          
          // Check if user is admin
          try {
            const userProfile = await FirebaseService.getUserProfile(user.uid);
            setIsAdmin(userProfile?.isAdmin || false);
          } catch (error) {
            console.error("Error checking admin status:", error);
            setIsAdmin(false);
          }
        }
        
        setIsLoading(false);
      });

      return unsubscribe;
    }
  }, []);

  const signUp = async (email: string, password: string, nickname: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      if (USE_MOCK_SERVICES) {
        const user = await MockService.registerUser(email, password, nickname);
        return user;
      } else {
        const user = await FirebaseService.registerUser(email, password, nickname);
        return user;
      }
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      if (USE_MOCK_SERVICES) {
        const user = await MockService.signInUser(email, password);
        setCurrentUser(user);
        setIsAnonymous(user.isAnonymous);
        setIsAdmin(user.isAdmin);
        return user;
      } else {
        const user = await FirebaseService.signInUser(email, password);
        return user;
      }
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithNickname = async (nickname: string): Promise<User | null> => {
    try {
      setIsLoading(true);
      if (USE_MOCK_SERVICES) {
        const user = await MockService.signInAsGuest(nickname);
        setCurrentUser(user);
        setIsAnonymous(true);
        setIsAdmin(false);
        return user;
      } else {
        const user = await FirebaseService.signInAsGuest(nickname);
        return user;
      }
    } catch (error: any) {
      toast({
        title: "Guest Sign In Failed",
        description: error.message || "Failed to sign in as guest",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      setIsLoading(true);
      if (USE_MOCK_SERVICES) {
        await MockService.signOut();
        setCurrentUser(null);
        setIsAnonymous(false);
        setIsAdmin(false);
      } else {
        await firebaseSignOut(auth);
      }
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      setIsLoading(true);
      if (USE_MOCK_SERVICES) {
        // In mock mode, just simulate a successful password reset
        console.log("Mock: Password reset for", email);
        toast({
          title: "Reset Email Sent (Mock)",
          description: "This is a mock reset. In a real app, check your email for instructions."
        });
      } else {
        await sendPasswordResetEmail(auth, email);
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions."
        });
      }
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: any): Promise<void> => {
    try {
      if (!currentUser) throw new Error("No user logged in");

      if (USE_MOCK_SERVICES) {
        if (data.nickname) {
          await MockService.updateProfile(currentUser as any, { 
            displayName: data.nickname 
          });
        }
        
        await MockService.updateUserProfile(currentUser.uid, data);
        
        // Update admin status if present in data
        if (data.isAdmin !== undefined) {
          setIsAdmin(data.isAdmin);
        }
        
        // Force refresh of the current user
        setCurrentUser({...currentUser});
      } else {
        // Update Firestore user document
        await FirebaseService.updateUserProfile(currentUser.uid, data);

        // Update display name if provided
        if (data.nickname) {
          await firebaseUpdateProfile(currentUser, { displayName: data.nickname });
        }
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteUserAccount = async (): Promise<void> => {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      if (USE_MOCK_SERVICES) {
        // In mock mode, just simulate account deletion
        console.log("Mock: Deleting user account");
        await MockService.signOut();
        setCurrentUser(null);
        setIsAnonymous(false);
        setIsAdmin(false);
      } else {
        // Delete the user from Authentication
        await firebaseDeleteUser(currentUser);
      }
      
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted."
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const convertAnonymousAccount = async (email: string, password: string): Promise<void> => {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      if (USE_MOCK_SERVICES) {
        // Create a new regular user with the provided email
        const newUser = await MockService.registerUser(email, password, currentUser.displayName || "User");
        setCurrentUser(newUser);
        setIsAnonymous(false);
      } else {
        if (!currentUser.isAnonymous) throw new Error("User is not anonymous");
        
        // This requires Firebase auth to handle anonymous account linking
        const { EmailAuthProvider, linkWithCredential } = require('firebase/auth');
        const credential = EmailAuthProvider.credential(email, password);
        
        // Link the anonymous account with the email credential
        await linkWithCredential(currentUser, credential);
        
        // Update the user profile in Firestore
        await FirebaseService.updateUserProfile(currentUser.uid, {
          email,
          isAnonymous: false
        });
      }
      
      toast({
        title: "Account Upgraded",
        description: "Your guest account has been converted to a full account."
      });
    } catch (error: any) {
      toast({
        title: "Account Conversion Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  // Function to switch between mock users for testing
  const switchToUserRole = (role: 'admin' | 'vip' | 'regular' | 'guest') => {
    if (USE_MOCK_SERVICES) {
      const user = MockService.switchMockUser(role);
      setCurrentUser(user);
      setIsAnonymous(user.isAnonymous);
      setIsAdmin(user.isAdmin);
      
      toast({
        title: `Switched to ${role.toUpperCase()} User`,
        description: `You are now using a ${role} account for testing.`
      });
    }
  };

  const value = {
    currentUser,
    isLoading,
    isAnonymous,
    isAdmin,
    signUp,
    signIn,
    signInWithNickname,
    logOut,
    resetPassword,
    updateUserProfile,
    deleteUserAccount,
    convertAnonymousAccount,
    ...(USE_MOCK_SERVICES ? { switchToUserRole } : {})
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
