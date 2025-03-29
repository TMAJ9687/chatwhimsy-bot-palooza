
import { useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { saveVipUserProfile, getVipUserProfile } from '@/firebase/firestore';

export const useFirestoreSync = () => {
  const firestoreSyncRef = useRef(false);
  
  const loadVipUserFromFirestore = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const firestoreUser = await getVipUserProfile(userId);
      
      if (firestoreUser) {
        console.log('Loaded VIP user from Firestore:', firestoreUser.nickname);
        
        if (firestoreUser.gender && firestoreUser.age && firestoreUser.country) {
          localStorage.setItem('vipProfileComplete', 'true');
        }
        
        return firestoreUser;
      } else {
        console.log('VIP user not found in Firestore, will save on next update');
      }
    } catch (error) {
      console.error('Error loading VIP user from Firestore:', error);
    }
    
    return null;
  }, []);

  const saveVipUserToFirestore = useCallback(async (profile: UserProfile): Promise<void> => {
    try {
      await saveVipUserProfile(profile);
      console.log('Saved VIP user to Firestore:', profile.nickname);
    } catch (error) {
      console.error('Error saving VIP user to Firestore:', error);
      
      // Fallback to localStorage
      localStorage.setItem('chatUser', JSON.stringify(profile));
    }
  }, []);

  return {
    loadVipUserFromFirestore,
    saveVipUserToFirestore,
    firestoreSyncRef
  };
};
