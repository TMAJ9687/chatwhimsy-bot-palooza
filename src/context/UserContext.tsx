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
    // Check if logout event is present and handle accordingly
    if(localStorage.getItem('logoutEvent')) {
      console.log('Logout event detected, skipping user loading');
      localStorage.removeItem('logoutEvent');
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      return;
    }
    
    // Try to load user from localStorage if not already loaded
    if (!user) {
      const storedUser = localStorage.getItem('chatUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    }
    
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

  // Add a global storage event listener for logout coordination
  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'logoutEvent') {
        console.log('Logout event received from another tab/window');
        clearUser();
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  // Memoized profile completion check
  const isProfileComplete = useMemo(() => 
    Boolean(user && user.gender && user.age && user.country),
    [user]
  );

  // Memoized VIP status check
  const isVip = useMemo(() => 
    Boolean(user?.isVip) || Boolean(user?.isAdmin),
    [user]
  );
  
  // Memoized admin status check
  const isAdmin = useMemo(() => 
    Boolean(user?.isAdmin),
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
      
      // Save updated user to localStorage
      localStorage.setItem('chatUser', JSON.stringify(updatedUser));
      
      // Use setTimeout to allow state updates to complete before releasing lock
      // Store the timeout reference so we can clear it later if needed
      profileUpdateTimeoutRef.current = setTimeout(() => {
        profileUpdateInProgressRef.current = false;
        profileUpdateTimeoutRef.current = null;
      }, 100);
      
      return updatedUser;
    });
  }, []);

  // Enhanced user cleanup function to ensure complete state reset
  const clearUser = useCallback(() => {
    console.log('Clearing user state from context');
    
    // Clean up any pending timeouts first
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
      profileUpdateTimeoutRef.current = null;
    }
    
    // Reset user state
    setUser(null);
    
    // Reset profile completion status
    profileSyncedRef.current = false;
    
    // Clear all user-related local storage
    localStorage.removeItem('vipProfileComplete');
    sessionStorage.clear();
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
