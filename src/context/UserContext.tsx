
import React, { createContext, useState, useContext, ReactNode } from 'react';

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

  const isProfileComplete = Boolean(
    user && user.gender && user.age && user.country
  );

  const isVip = Boolean(user?.isVip);

  const updateUserProfile = (profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return profile as UserProfile;
      return { ...prev, ...profile };
    });
  };

  const clearUser = () => {
    setUser(null);
  };

  const subscribeToVip = (tier: SubscriptionTier) => {
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
    
    updateUserProfile({ 
      isVip: true, 
      subscriptionTier: tier,
      subscriptionEndDate: endDate,
      imagesRemaining: Infinity,
      voiceMessagesRemaining: Infinity
    });
  };
  
  const cancelVipSubscription = () => {
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
