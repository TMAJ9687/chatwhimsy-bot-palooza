
import { useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { saveVipUserProfile, saveUserProfileToFirestore } from '@/firebase/firestore';
import { firestoreAvailable } from '@/firebase/config';

export const useProfileUpdater = (
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const profileUpdateInProgressRef = useRef(false);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const firestoreErrorsRef = useRef(0);
  const MIN_UPDATE_INTERVAL = 1000; // Minimum time between Firestore updates
  const MAX_FIRESTORE_ERRORS = 3; // After this many errors, stop trying to use Firestore

  const updateProfile = useCallback(async (
    profile: Partial<UserProfile>,
    currentUser: UserProfile | null
  ): Promise<void> => {
    if (profileUpdateInProgressRef.current) {
      console.warn('Profile update already in progress, queuing update');
      setTimeout(() => updateProfile(profile, currentUser), 100);
      return;
    }
    
    profileUpdateInProgressRef.current = true;
    console.log('Updating user profile:', profile);
    
    if (profileUpdateTimeoutRef.current) {
      clearTimeout(profileUpdateTimeoutRef.current);
    }
    
    setUser((prev) => {
      if (!prev) {
        // Creating a new user
        const newUser = {
          ...profile,
          id: profile.id || Math.random().toString(36).substring(2, 15),
          nickname: profile.nickname || 'User',
          email: profile.email || '',
          gender: profile.gender || 'male',
          age: profile.age || 25,
          country: profile.country || 'US',
          interests: profile.interests || [],
          isVip: profile.isVip === true,
          isAdmin: profile.isAdmin === true,
          subscriptionTier: profile.subscriptionTier || 'none',
          imagesRemaining: profile.imagesRemaining || 15,
          voiceMessagesRemaining: profile.voiceMessagesRemaining || 0
        } as UserProfile;
        
        // Save the new user to storage
        saveToStorage(newUser);
        
        return newUser;
      }
      
      const updatedUser = { ...prev, ...profile };
      
      if (updatedUser.isVip === undefined) {
        updatedUser.isVip = Boolean(prev.isVip);
      }
      
      const wouldCompleteProfile = Boolean(
        updatedUser.gender && 
        updatedUser.age && 
        updatedUser.country
      );
      
      if (wouldCompleteProfile && updatedUser.isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Save the updated user to storage
      saveToStorage(updatedUser);
      
      return updatedUser;
    });
    
    profileUpdateTimeoutRef.current = setTimeout(() => {
      profileUpdateInProgressRef.current = false;
      profileUpdateTimeoutRef.current = null;
    }, 100);
  }, [setUser]);

  // Helper function to save to Firestore or localStorage based on user type
  const saveToStorage = async (user: UserProfile) => {
    try {
      // Always save to localStorage first
      localStorage.setItem('chatUser', JSON.stringify(user));
      
      // Set profile complete flag if applicable  
      if (user.gender && user.age && user.country && user.isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      // Skip Firestore if we've had too many errors or it's not available
      if (firestoreErrorsRef.current >= MAX_FIRESTORE_ERRORS || !firestoreAvailable) {
        console.log('Skipping Firestore (errors exceeded or not available), using localStorage only');
        return;
      }
      
      // Only save to Firestore if rate limit hasn't been exceeded
      const now = Date.now();
      if (now - lastUpdateTimeRef.current < MIN_UPDATE_INTERVAL) {
        // Firestore update skipped due to rate limiting
        console.log('Skipped Firestore update (rate limited), saved to localStorage');
        return;
      }
      
      lastUpdateTimeRef.current = now;
      
      if (user.isVip) {
        // For VIP users, save to Firestore
        await saveVipUserProfile(user);
        console.log('Saved VIP user to Firestore');
      } else {
        // For regular users, save to Firestore but with regular user flag
        await saveUserProfileToFirestore(user);
        console.log('Saved regular user to Firestore');
      }
    } catch (error) {
      console.error('Error saving user to storage:', error);
      
      // Increment the error count
      firestoreErrorsRef.current++;
      
      if (firestoreErrorsRef.current >= MAX_FIRESTORE_ERRORS) {
        console.warn(`Firestore errors exceeded threshold (${MAX_FIRESTORE_ERRORS}), switching to localStorage only`);
      }
    }
  };

  return {
    updateProfile,
    profileUpdateInProgressRef,
    profileUpdateTimeoutRef
  };
};
