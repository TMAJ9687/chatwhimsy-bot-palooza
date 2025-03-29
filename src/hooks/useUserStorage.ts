
import { useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { useLocalStorage } from './storage/useLocalStorage';
import { useFirestoreSync } from './storage/useFirestoreSync';
import { useProfileUpdater } from './storage/useProfileUpdater';

export const useUserStorage = (
  user: UserProfile | null,
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const profileSyncedRef = useRef(false);
  const { loadUserFromLocalStorage, saveUserToLocalStorage, userLoadAttemptedRef } = useLocalStorage();
  const { loadVipUserFromFirestore, saveVipUserToFirestore, firestoreSyncRef } = useFirestoreSync();
  const { updateProfile, profileUpdateInProgressRef, profileUpdateTimeoutRef } = useProfileUpdater(setUser);

  useEffect(() => {
    if (userLoadAttemptedRef.current) {
      return;
    }
    
    if(localStorage.getItem('logoutEvent')) {
      console.log('Logout event detected, skipping user loading');
      localStorage.removeItem('logoutEvent');
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      return;
    }
    
    if (!user) {
      userLoadAttemptedRef.current = true;
      const loadedUser = loadUserFromLocalStorage();
      
      if (loadedUser) {
        setUser(loadedUser);
        
        if (loadedUser.isVip && !firestoreSyncRef.current && loadedUser.id) {
          firestoreSyncRef.current = true;
          
          loadVipUserFromFirestore(loadedUser.id).then(firestoreUser => {
            if (firestoreUser) {
              setUser(firestoreUser);
              saveUserToLocalStorage(firestoreUser);
            }
          });
        }
      }
    }
    
    if (user && user.isVip) {
      const storedProfileComplete = localStorage.getItem('vipProfileComplete') === 'true';
      
      if (!profileSyncedRef.current && storedProfileComplete && 
          !(user.gender && user.age && user.country)) {
        profileSyncedRef.current = true;
        
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
      if (profileUpdateTimeoutRef.current) {
        clearTimeout(profileUpdateTimeoutRef.current);
      }
    };
  }, [user, setUser, loadUserFromLocalStorage, loadVipUserFromFirestore, saveUserToLocalStorage]);

  const updateUserProfile = useCallback((profile: Partial<UserProfile>) => {
    updateProfile(profile, user);
  }, [updateProfile, user]);

  return { updateUserProfile };
};

export default useUserStorage;
