
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { auth, db, initializeFirestore } from '@/lib/firebase';
import { 
  getUserProfile, 
  createUserProfile, 
  updateUserProfile as updateFirestoreProfile,
  signInAsGuest,
  registerUser,
  signInUser
} from '@/services/firebaseAuth';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAnonymous: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  signInWithNickname: (nickname: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
  convertAnonymousAccount: (email: string, password: string) => Promise<void>;
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
  const { toast } = useToast();

  // Initialize Firestore collections when the app starts
  useEffect(() => {
    initializeFirestore().catch(error => {
      console.error("Failed to initialize Firestore collections:", error);
    });
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsAnonymous(user?.isAnonymous || false);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, nickname: string): Promise<User | null> => {
    try {
      const user = await registerUser(email, password, nickname);
      return user;
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const signIn = async (email: string, password: string): Promise<User | null> => {
    try {
      const user = await signInUser(email, password);
      return user;
    } catch (error: any) {
      toast({
        title: "Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const signInWithNickname = async (nickname: string): Promise<User | null> => {
    try {
      const user = await signInAsGuest(nickname);
      return user;
    } catch (error: any) {
      toast({
        title: "Guest Sign In Failed",
        description: error.message,
        variant: "destructive"
      });
      return null;
    }
  };

  const logOut = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error: any) {
      toast({
        title: "Sign Out Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Reset Email Sent",
        description: "Check your email for password reset instructions."
      });
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const updateUserProfile = async (data: any): Promise<void> => {
    try {
      if (!currentUser) throw new Error("No user logged in");

      // Update Firestore user document
      await updateFirestoreProfile(currentUser.uid, {
        ...data,
        updatedAt: serverTimestamp()
      });

      // Update display name if provided
      if (data.nickname) {
        await updateProfile(currentUser, { displayName: data.nickname });
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
    }
  };

  const deleteUserAccount = async (): Promise<void> => {
    try {
      if (!currentUser) throw new Error("No user logged in");
      
      // Delete the user from Authentication
      await deleteUser(currentUser);
      
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
      if (!currentUser.isAnonymous) throw new Error("User is not anonymous");
      
      // This requires Firebase auth to handle anonymous account linking
      // We use the EmailAuthProvider to create credentials
      const { EmailAuthProvider, linkWithCredential } = require('firebase/auth');
      const credential = EmailAuthProvider.credential(email, password);
      
      // Link the anonymous account with the email credential
      await linkWithCredential(currentUser, credential);
      
      // Update the user profile in Firestore
      await updateFirestoreProfile(currentUser.uid, {
        email,
        isAnonymous: false,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setIsAnonymous(false);
      
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

  const value = {
    currentUser,
    isLoading,
    isAnonymous,
    signUp,
    signIn,
    signInWithNickname,
    logOut,
    resetPassword,
    updateUserProfile,
    deleteUserAccount,
    convertAnonymousAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
