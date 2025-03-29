
import { useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';
import { 
  saveVipUserProfile, 
  getVipUserProfile, 
  migrateUserProfileToFirestore 
} from '@/firebase/firestore';
import { firestoreAvailable } from '@/firebase/config';
import { toast } from '@/hooks/use-toast';

export const useFirestoreSync = () => {
  const firestoreSyncRef = useRef(false);
  const migrationAttemptedRef = useRef(false);
  const firestoreErrorShownRef = useRef(false);
  
  const loadVipUserFromFirestore = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!firestoreAvailable) {
      console.log('Firestore not available, skipping profile load');
      return null;
    }
    
    try {
      // Try to migrate profile if not already attempted
      if (!migrationAttemptedRef.current) {
        migrationAttemptedRef.current = true;
        await migrateUserProfileToFirestore(userId);
      }
      
      // Now try to load from Firestore
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
      
      // Only show the toast once per session
      if (!firestoreErrorShownRef.current) {
        firestoreErrorShownRef.current = true;
      }
    }
    
    return null;
  }, []);

  const saveVipUserToFirestore = useCallback(async (profile: UserProfile): Promise<void> => {
    // Always save to localStorage first as our reliable storage
    localStorage.setItem('chatUser', JSON.stringify(profile));
    
    // Set profile complete flag if applicable
    if (profile.gender && profile.age && profile.country && profile.isVip) {
      localStorage.setItem('vipProfileComplete', 'true');
    }
    
    // Skip Firestore if we know it's not available
    if (!firestoreAvailable) {
      console.log('Skipping Firestore save (not available)');
      return;
    }
    
    try {
      await saveVipUserProfile(profile);
      console.log('Saved VIP user to Firestore:', profile.nickname);
    } catch (error) {
      console.error('Error saving VIP user to Firestore:', error);
      
      // Only show the toast once per session
      if (!firestoreErrorShownRef.current) {
        firestoreErrorShownRef.current = true;
        toast({
          title: 'Offline Mode',
          description: 'Using local storage for your profile',
          variant: 'default'
        });
      }
    }
  }, []);

  return {
    loadVipUserFromFirestore,
    saveVipUserToFirestore,
    firestoreSyncRef,
    migrationAttemptedRef
  };
};
