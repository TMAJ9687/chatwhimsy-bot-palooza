
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

  // Enhanced profile loading from localStorage with better logging
  useEffect(() => {
    // Prevent multiple loading attempts
    if (userLoadAttemptedRef.current) {
      return;
    }
    
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
      userLoadAttemptedRef.current = true;
      const storedUser = localStorage.getItem('chatUser');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Ensure isVip flag is explicitly set for standard users
          if (parsedUser && parsedUser.isVip === undefined) {
            parsedUser.isVip = false;
          }
          
          console.log('Loaded user from localStorage:', parsedUser.nickname, 'isVip:', parsedUser.isVip);
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
        
        console.log('Profile data synchronized from localStorage');
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
      console.warn('Profile update already in progress, queuing update');
      // Queue the update for after the current one completes
      setTimeout(() => updateUserProfile(profile), 100);
      return;
    }
    
    profileUpdateInProgressRef.current = true;
    console.log('Updating user profile:', profile);
    
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
        console.log('Creating new user profile in localStorage:', newUser.nickname, 'isVip:', newUser.isVip);
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
      console.log('Saving updated user to localStorage:', updatedUser.nickname, 'isVip:', updatedUser.isVip);
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
