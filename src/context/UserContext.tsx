
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo } from 'react';
import { UserProfile, UserContextType, SubscriptionTier } from '@/types/user';
import { useVipSubscription } from '@/hooks/useVipSubscription';
import useUserStorage from '@/hooks/useUserStorage';
import useLogoutSync from '@/hooks/useLogoutSync';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);

  // Load user data from storage and handle updates
  const { updateUserProfile } = useUserStorage(user, setUser);
  
  // Handle logout synchronization across tabs
  useLogoutSync();

  // Enhanced user cleanup function to ensure complete state reset
  const clearUser = useCallback(() => {
    console.log('Clearing user state from context');
    
    // Reset user state
    setUser(null);
    
    // Clear all user-related local storage
    localStorage.removeItem('vipProfileComplete');
    localStorage.removeItem('chatUser');
    sessionStorage.clear();
  }, []);

  const { subscribeToVip, cancelVipSubscription } = useVipSubscription(updateUserProfile);

  // Memoized computed values
  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  const isVip = useMemo(() => 
    Boolean(user?.isVip) || Boolean(user?.isAdmin),
    [user]
  );
  
  const isAdmin = useMemo(() => 
    Boolean(user?.isAdmin),
    [user]
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    setUser,
    isProfileComplete,
    updateUserProfile,
    clearUser,
    isVip,
    isAdmin,
    subscribeToVip,
    cancelVipSubscription
  }), [
    user, 
    setUser, 
    isProfileComplete, 
    updateUserProfile, 
    clearUser, 
    isVip,
    isAdmin,
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
