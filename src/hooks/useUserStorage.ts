
import { useCallback, useEffect, useRef } from 'react';
import { UserProfile } from '@/types/user';

export const useUserStorage = (
  user: UserProfile | null,
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const profileSyncedRef = useRef(false);
  const profileUpdateInProgressRef = useRef(false);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userLoadAttemptedRef = useRef(false);
  const preventReloadCycleRef = useRef(false);

  // Enhanced profile loading from localStorage with better logging
  useEffect(() => {
    // Prevent multiple loading attempts
    if (userLoadAttemptedRef.current) {
      return;
    }
    
    // Check if logout event is present and handle accordingly
    if(localStorage.getItem('logoutEvent')) {
      localStorage.removeItem('logoutEvent');
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      return;
    }
    
    // Set a flag to prevent reload cycles
    preventReloadCycleRef.current = true;
    
    // Try to load user from localStorage if not already loaded
    if (!user) {
      userLoadAttemptedRef.current = true;
      const storedUser = localStorage.getItem('chatUser');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Ensure isVip flag is explicitly set for standard users
          if (parsedUser && parsedUser.isVip === undefined) {
            parsedUser.isVip = false;
          }
          
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
      if (!profileSyncedRef.current && storedProfileComplete && 
          !(user.gender && user.age && user.country)) {
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
      }
    }

    return () => {
      // Clean up any pending timeouts
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, [user, setUser]);

  // Enhanced profile update function with safety mechanisms and proper cleanup
  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    // Prevent concurrent updates with a safer approach
    if (profileUpdateInProgressRef.current) {
      // Queue the update for after the current one completes
      setTimeout(() => updateUserProfile(profile), 100);
      return;
    }
    
    profileUpdateInProgressRef.current = true;
    
    // Clean up any existing timeout to prevent memory leaks
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
    }
    
    setUser((prev) => {
      if (!prev) {
        // Create new user profile
        const newUser = {
          ...profile,
          // Ensure isVip is explicitly set (default to false for standard users)
          isVip: profile.isVip === true
        } as UserProfile;
        
        // Save to localStorage
        localStorage.setItem('chatUser', JSON.stringify(newUser));
        
        return newUser;
      }
      
      const updatedUser = { ...prev, ...profile };
      
      // Ensure isVip is always explicitly defined
      if (updatedUser.isVip === undefined) {
        updatedUser.isVip = false;
      }
      
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
  }, [setUser]);
  
  return { updateUserProfile };
};

export default useUserStorage;
