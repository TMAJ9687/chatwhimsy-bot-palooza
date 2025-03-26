
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { UserProfile, UserContextType, SubscriptionTier } from '@/types/user';
import { useVipSubscription } from '@/hooks/useVipSubscription';
import { useUserBlocking } from '@/hooks/useUserBlocking';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const { blockedUsers, isUserBlocked, handleBlockUser, handleUnblockUser } = useUserBlocking();

  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  const isVip = useMemo(() => 
    Boolean(user?.isVip),
    [user]
  );

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return profile as UserProfile;
      return { ...prev, ...profile };
    });
  }, []);

  const clearUser = useCallback(() => {
    setUser(null);
  }, []);

  const { subscribeToVip, cancelVipSubscription } = useVipSubscription(updateUserProfile);

  const contextValue: UserContextType = {
    user,
    setUser,
    isProfileComplete,
    updateUserProfile,
    clearUser,
    isVip,
    subscribeToVip,
    cancelVipSubscription,
    isUserBlocked
  };

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
