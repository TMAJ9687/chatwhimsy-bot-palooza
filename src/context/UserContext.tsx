
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { UserProfile, UserContextType, SubscriptionTier } from '@/types/user';
import { useVipSubscription } from '@/hooks/useVipSubscription';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load profile completion status from localStorage on mount
  useEffect(() => {
    // If user is VIP, check localStorage for profile completion state
    if (user && user.isVip) {
      const storedProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
      if (storedProfileComplete && !isProfileComplete) {
        // Update user with profile complete flag
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            // Add some basic profile fields so isProfileComplete will evaluate to true
            gender: prev.gender || 'male',
            age: prev.age || 25,
            country: prev.country || 'us'
          };
        });
      }
    }
  }, [user]);

  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  const isVip = useMemo(() => 
    Boolean(user?.isVip),
    [user]
  );

  // Update both state and localStorage when profile is updated
  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return profile as UserProfile;
      
      const updatedUser = { ...prev, ...profile };
      
      // Check if this update would complete the profile
      const wouldCompleteProfile = Boolean(
        updatedUser.gender && 
        updatedUser.age && 
        updatedUser.country
      );
      
      // Update localStorage if profile becomes complete
      if (wouldCompleteProfile && updatedUser.isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      return updatedUser;
    });
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
    // Clear profile completion status
    localStorage.removeItem('vipProfileComplete');
  }, []);

  const { subscribeToVip, cancelVipSubscription } = useVipSubscription(updateUserProfile);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser,
    isProfileComplete,
    updateUserProfile,
    clearUser,
    isVip,
    subscribeToVip,
    cancelVipSubscription
  }), [
    user, 
    setUser, 
    isProfileComplete, 
    updateUserProfile, 
    clearUser, 
    isVip, 
    subscribeToVip, 
    cancelVipSubscription
  ]);

  return (
    <UserContext.Provider value={contextValue}>
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
