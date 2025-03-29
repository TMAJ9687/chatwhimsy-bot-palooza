
import { useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { saveVipUserProfile } from '@/firebase/firestore';

export const useProfileUpdater = (
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const profileUpdateInProgressRef = useRef(false);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        const newUser = {
          ...profile,
          isVip: profile.isVip === true
        } as UserProfile;
        
        if (newUser.isVip) {
          saveVipUserProfile(newUser).catch(err => {
            console.error('Error saving new VIP user to Firestore:', err);
          });
        } else {
          localStorage.setItem('chatUser', JSON.stringify(newUser));
        }
        
        return newUser;
      }
      
      const updatedUser = { ...prev, ...profile };
      
      if (updatedUser.isVip === undefined) {
        updatedUser.isVip = false;
      }
      
      const wouldCompleteProfile = Boolean(
        updatedUser.gender && 
        updatedUser.age && 
        updatedUser.country
      );
      
      if (wouldCompleteProfile && updatedUser.isVip) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
      
      if (updatedUser.isVip) {
        saveVipUserProfile(updatedUser).catch(err => {
          console.error('Error saving updated VIP user to Firestore:', err);
          localStorage.setItem('chatUser', JSON.stringify(updatedUser));
        });
      } else {
        localStorage.setItem('chatUser', JSON.stringify(updatedUser));
      }
      
      profileUpdateTimeoutRef.current = setTimeout(() => {
        profileUpdateInProgressRef.current = false;
        profileUpdateTimeoutRef.current = null;
      }, 100);
      
      return updatedUser;
    });
  }, [setUser]);

  return {
    updateProfile,
    profileUpdateInProgressRef,
    profileUpdateTimeoutRef
  };
};
