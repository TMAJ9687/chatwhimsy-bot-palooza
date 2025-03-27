
import React, { createContext, useState, useContext, ReactNode, useCallback, useMemo, useEffect, useRef } from 'react';
import { UserProfile, UserContextType, SubscriptionTier } from '@/types/user';
import { useVipSubscription } from '@/hooks/useVipSubscription';

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const profileSyncedRef = useRef(false);
  const profileUpdateInProgressRef = useRef(false);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced profile loading from localStorage
  useEffect(() => {
    // If user is VIP, check localStorage for profile completion state
    if (user && user.isVip) {
      const storedProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
      
      // Only update if not already synced and profile is incomplete but localStorage says complete
      if (!profileSyncedRef.current && storedProfileComplete && !isProfileComplete) {
        profileSyncedRef.current = true;
        
        // Update user with profile complete flag and basic profile data
        setUser(prev => {
          if (!prev) return null;
          return {
            ...prev,
            gender: prev.gender || 'male',
            age: prev.age || 25,
            country: prev.country || 'us'
          };
        });
        
        console.log('Profile data synchronized from localStorage');
      }
    }

    return () => {
      // Clean up any pending timeouts
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, [user]);

  // Memoized profile completion check
  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  // Memoized VIP status check
  const isVip = useMemo(() => 
    Boolean(user?.isVip),
    [user]
  );

  // Enhanced profile update function with safety mechanisms and proper cleanup
  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    // Prevent concurrent updates with a safer approach
    if (profileUpdateInProgressRef.current) {
      console.warn('Profile update already in progress, ignoring concurrent update');
      return;
    }
    
    profileUpdateInProgressRef.current = true;
    
    // Clean up any existing timeout to prevent memory leaks
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
    }
    
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
        profileSyncedRef.current = true;
      }
      
      // Use setTimeout to allow state updates to complete before releasing lock
      // Store the timeout reference so we can clear it later if needed
      profileUpdateTimeoutRef.current = setTimeout(() => {
        profileUpdateInProgressRef.current = false;
        profileUpdateTimeoutRef.current = null;
      }, 100);
      
      return updatedUser;
    });
  }, []);

  // User cleanup function
  const clearUser = useCallback(() => {
    // Clean up any pending timeouts first
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
      profileUpdateTimeoutRef.current = null;
    }
    
    setUser(null);
    // Clear profile completion status
    localStorage.removeItem('vipProfileComplete');
    profileSyncedRef.current = false;
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
