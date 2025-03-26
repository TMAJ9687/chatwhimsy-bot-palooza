
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { getUserProfile, updateUserProfile, getSubscription, createSubscription, cancelSubscription } from '@/services/firebaseService';

type Gender = 'male' | 'female';
type Interest = string;
type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';

interface UserProfile {
  nickname: string;
  gender?: Gender;
  age?: number;
  country?: string;
  interests?: Interest[];
  email?: string;
  isVip?: boolean;
  isAnonymous?: boolean; // Added this property to fix the TypeScript error
  subscriptionTier?: SubscriptionTier;
  subscriptionEndDate?: Date;
  imagesRemaining?: number;
  voiceMessagesRemaining?: number;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isProfileComplete: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
  isVip: boolean;
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { currentUser, updateUserProfile: updateFirebaseProfile } = useAuth();

  // Fetch user data from Firebase when auth state changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        // Get user profile from Firestore
        const userProfile = await getUserProfile(currentUser.uid);
        
        // If no profile, create defaults
        if (!userProfile) {
          // Set default user data
          setUser({
            nickname: currentUser.displayName || 'User',
            email: currentUser.email || undefined,
            isVip: false,
            isAnonymous: currentUser.isAnonymous,
            imagesRemaining: 15,
            voiceMessagesRemaining: 0,
            subscriptionTier: 'none'
          });
          return;
        }
        
        // Get subscription data
        const subscription = await getSubscription(currentUser.uid);
        
        // Combine the data
        setUser({
          nickname: currentUser.displayName || 'User',
          email: currentUser.email || undefined,
          ...userProfile,
          isVip: subscription?.status === 'active' || false,
          subscriptionTier: subscription?.plan as SubscriptionTier || 'none',
          subscriptionEndDate: subscription?.endDate ? new Date(subscription.endDate) : undefined
        });
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [currentUser]);

  const isProfileComplete = Boolean(
    user && user.gender && user.age && user.country
  );

  const isVip = Boolean(user?.isVip);

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      // Update user profile in Firestore
      await updateFirebaseProfile(profile);
      
      // Update local state
      setUser((prev) => {
        if (!prev) return profile as UserProfile;
        return { ...prev, ...profile };
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
    }
  };

  const clearUser = () => {
    setUser(null);
  };

  const subscribeToVip = async (tier: SubscriptionTier) => {
    if (!currentUser) return;
    
    let endDate = new Date();
    
    switch(tier) {
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'semiannual':
        endDate.setMonth(endDate.getMonth() + 6);
        break;
      case 'annual':
        endDate.setFullYear(endDate.getFullYear() + 1);
        break;
      default:
        break;
    }
    
    // Create the subscription in Firestore
    await createSubscription(currentUser.uid, tier, endDate);
    
    // Update the user profile
    updateUserProfile({ 
      isVip: true, 
      subscriptionTier: tier,
      subscriptionEndDate: endDate,
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity
    });
  };
  
  const cancelVipSubscription = async () => {
    if (!currentUser) return;
    
    // Cancel the subscription in Firestore
    await cancelSubscription(currentUser.uid);
    
    // Update the user profile
    updateUserProfile({ 
      isVip: false, 
      subscriptionTier: 'none',
      subscriptionEndDate: undefined,
      imagesRemaining: 15,
      voiceMessagesRemaining: 0
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isProfileComplete,
        updateUserProfile,
        clearUser,
        isVip,
        subscribeToVip,
        cancelVipSubscription
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
