
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { makeSerializable } from '@/utils/serialization';

// Import both real and mock services
import * as FirebaseService from '@/services/firebaseService';
import * as MockService from '@/services/mockFirebaseAuth';

// Flag to control whether to use mock services (must match FirebaseAuthContext)
const USE_MOCK_SERVICES = true;

type Gender = 'male' | 'female';
type Interest = string;
type SubscriptionTier = 'none' | 'monthly' | 'semiannual' | 'annual';
export type UserRole = 'admin' | 'vip' | 'regular' | 'guest';

interface UserProfile {
  nickname: string;
  gender?: Gender;
  age?: number;
  country?: string;
  interests?: Interest[];
  email?: string;
  isVip?: boolean;
  isAdmin?: boolean;
  isAnonymous?: boolean;
  role?: UserRole;
  subscriptionTier?: SubscriptionTier;
  subscriptionEndDate?: Date;
  imagesRemaining?: number;
  voiceMessagesRemaining?: number;
}

interface UserContextType {
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isProfileComplete: boolean;
  isAdmin: boolean;
  updateUserProfile: (profile: Partial<UserProfile>) => void;
  clearUser: () => void;
  isVip: boolean;
  subscribeToVip: (tier: SubscriptionTier) => void;
  cancelVipSubscription: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { currentUser, isAdmin: authIsAdmin, updateUserProfile: updateAuthProfile } = useAuth();

  // Fetch user data when auth state changes
  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        try {
          let userProfile;
          let subscription = null;
          
          if (USE_MOCK_SERVICES) {
            userProfile = await MockService.getUserProfile(currentUser.uid);
          } else {
            userProfile = await FirebaseService.getUserProfile(currentUser.uid);
            subscription = await FirebaseService.getSubscriptionSafe(currentUser.uid);
          }
          
          // If no profile, create defaults
          if (!userProfile) {
            // Set default user data
            setUser({
              nickname: currentUser.displayName || 'User',
              email: currentUser.email || undefined,
              isVip: USE_MOCK_SERVICES ? (currentUser as any)?.isVip || false : false,
              isAdmin: USE_MOCK_SERVICES ? (currentUser as any)?.isAdmin || false : authIsAdmin || false,
              role: USE_MOCK_SERVICES ? (currentUser as any)?.role || 'regular' : 'regular',
              isAnonymous: currentUser.isAnonymous,
              imagesRemaining: 15,
              voiceMessagesRemaining: 0,
              subscriptionTier: 'none'
            });
            return;
          }
          
          // Combine the data
          const profileData = userProfile ? makeSerializable({ ...userProfile }) : {};
          
          setUser({
            nickname: currentUser.displayName || 'User',
            email: currentUser.email || undefined,
            ...profileData,
            isVip: USE_MOCK_SERVICES 
              ? profileData.isVip || (currentUser as any)?.isVip || false
              : subscription?.status === 'active' || false,
            isAdmin: profileData.isAdmin || authIsAdmin || false,
            role: profileData.role || 'regular',
            subscriptionTier: subscription?.plan as SubscriptionTier || 'none',
            subscriptionEndDate: subscription?.endDate ? new Date(subscription.endDate) : undefined
          });
        } catch (error) {
          console.error("Error fetching user data:", error);
          // Set basic user data even if there's an error
          setUser({
            nickname: currentUser.displayName || 'User',
            email: currentUser.email || undefined,
            isVip: USE_MOCK_SERVICES ? (currentUser as any)?.isVip || false : false,
            isAdmin: USE_MOCK_SERVICES ? (currentUser as any)?.isAdmin || false : authIsAdmin || false,
            role: USE_MOCK_SERVICES ? (currentUser as any)?.role || 'regular' : 'regular',
            isAnonymous: currentUser.isAnonymous,
            imagesRemaining: 15,
            voiceMessagesRemaining: 0,
            subscriptionTier: 'none'
          });
        }
      } else {
        setUser(null);
      }
    };

    fetchUserData();
  }, [currentUser, authIsAdmin]);

  const isProfileComplete = Boolean(
    user && user.gender && user.age && user.country
  );

  const isVip = Boolean(user?.isVip);
  const isAdmin = Boolean(user?.isAdmin);

  const updateUserProfile = async (profile: Partial<UserProfile>) => {
    if (!currentUser) return;
    
    try {
      // Make the profile data serializable
      const safeProfile = makeSerializable(profile);
      
      // Update auth context (which will update Firebase or mock)
      await updateAuthProfile(safeProfile);
      
      // Update local state
      setUser((prev) => {
        if (!prev) return safeProfile as UserProfile;
        return { ...prev, ...safeProfile };
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
    
    try {
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
      
      if (!USE_MOCK_SERVICES) {
        // Create the subscription in Firestore
        await FirebaseService.createSubscriptionSafe(currentUser.uid, tier, endDate);
      }
      
      // Update the user profile
      const profileUpdate = makeSerializable({ 
        isVip: true, 
        role: user?.isAdmin ? 'admin' : 'vip',
        subscriptionTier: tier,
        subscriptionEndDate: endDate,
        imagesRemaining: Infinity,
        voiceMessagesRemaining: Infinity
      });
      
      updateUserProfile(profileUpdate);
    } catch (error) {
      console.error("Error subscribing to VIP:", error);
    }
  };
  
  const cancelVipSubscription = async () => {
    if (!currentUser) return;
    
    try {
      if (!USE_MOCK_SERVICES) {
        // Cancel the subscription in Firestore
        await FirebaseService.cancelSubscriptionSafe(currentUser.uid);
      }
      
      // Don't downgrade admin when canceling VIP
      const role = user?.isAdmin ? 'admin' : 'regular';
      const isVip = user?.isAdmin ? true : false;
      
      // Update the user profile
      updateUserProfile({ 
        isVip, 
        role,
        subscriptionTier: 'none',
        subscriptionEndDate: undefined,
        imagesRemaining: 15,
        voiceMessagesRemaining: 0
      });
    } catch (error) {
      console.error("Error canceling VIP subscription:", error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        isProfileComplete,
        isAdmin,
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
