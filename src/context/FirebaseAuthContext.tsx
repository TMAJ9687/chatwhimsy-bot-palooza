
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<User | null>;
  signIn: (email: string, password: string) => Promise<User | null>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: any) => Promise<void>;
  deleteUserAccount: () => Promise<void>;
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
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  const signUp = async (email: string, password: string, nickname: string): Promise<User | null> => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update user profile with nickname
      await updateProfile(user, { displayName: nickname });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        nickname,
        createdAt: serverTimestamp(),
        isVip: false,
        imagesRemaining: 15,
        voiceMessagesRemaining: 0,
        blockedUsers: []
      });
      
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
      const { user } = await signInWithEmailAndPassword(auth, email, password);
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
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
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

  const value = {
    currentUser,
    isLoading,
    signUp,
    signIn,
    logOut,
    resetPassword,
    updateUserProfile,
    deleteUserAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
