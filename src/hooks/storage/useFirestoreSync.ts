
import { useRef, useCallback, useEffect } from 'react';
import { UserProfile } from '@/types/user';
import { 
  saveVipUserProfile, 
  getVipUserProfile, 
  migrateUserProfileToFirestore 
} from '@/firebase/firestore';
import { firestoreAvailable, firestoreBlocked, detectFirestoreBlock } from '@/firebase/config';
import { toast } from '@/hooks/use-toast';

export const useFirestoreSync = () => {
  const firestoreSyncRef = useRef(false);
  const migrationAttemptedRef = useRef(false);
  const firestoreErrorShownRef = useRef(false);
  const connectionAttemptedRef = useRef(false);
  
  // Check for connection issues on mount
  useEffect(() => {
    if (!connectionAttemptedRef.current) {
      connectionAttemptedRef.current = true;
      
      // Run connection detection and show toast if blocked
      if (detectFirestoreBlock() || sessionStorage.getItem('firestoreBlocked') === 'true') {
        if (!firestoreErrorShownRef.current) {
          firestoreErrorShownRef.current = true;
          
          // Show toast for offline mode
          setTimeout(() => {
            toast({
              title: 'Offline Mode',
              description: 'Using local storage for your profile. Some features may be limited.',
              variant: 'default'
            });
          }, 1000);
        }
      }
    }
  }, []);
  
  const loadVipUserFromFirestore = useCallback(async (userId: string): Promise<UserProfile | null> => {
    // Skip if we know Firestore is blocked or unavailable
    if (firestoreBlocked || !firestoreAvailable || sessionStorage.getItem('firestoreBlocked') === 'true') {
      console.log('Firestore blocked or not available, skipping profile load');
      if (!firestoreErrorShownRef.current) {
        firestoreErrorShownRef.current = true;
        toast({
          title: 'Offline Mode',
          description: 'Using local storage for your profile',
          variant: 'default'
        });
      }
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
      
      // Check if error is related to connection being blocked
      if (error?.message?.includes('network') || 
          error?.message?.includes('permission') || 
          error?.message?.includes('blocked') ||
          error?.code === 'permission-denied') {
        
        // Increment error count to track connection issues
        const currentErrors = parseInt(sessionStorage.getItem('firestoreErrors') || '0');
        sessionStorage.setItem('firestoreErrors', String(currentErrors + 1));
        
        if (currentErrors > 2) {
          sessionStorage.setItem('firestoreBlocked', 'true');
        }
        
        // Only show the toast once per session
        if (!firestoreErrorShownRef.current) {
          firestoreErrorShownRef.current = true;
          toast({
            title: 'Offline Mode',
            description: 'Using local storage for your profile. Check if ad blockers are enabled.',
            variant: 'default'
          });
        }
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
    
    // Skip Firestore if we know it's blocked or not available
    if (firestoreBlocked || !firestoreAvailable || sessionStorage.getItem('firestoreBlocked') === 'true') {
      console.log('Skipping Firestore save (blocked or not available)');
      
      // Show offline toast if not already shown
      if (!firestoreErrorShownRef.current) {
        firestoreErrorShownRef.current = true;
        toast({
          title: 'Offline Mode',
          description: 'Changes saved locally. Check if ad blockers are enabled.',
          variant: 'default'
        });
      }
      return;
    }
    
    try {
      await saveVipUserProfile(profile);
      console.log('Saved VIP user to Firestore:', profile.nickname);
    } catch (error) {
      console.error('Error saving VIP user to Firestore:', error);
      
      // Increment error count
      const currentErrors = parseInt(sessionStorage.getItem('firestoreErrors') || '0');
      sessionStorage.setItem('firestoreErrors', String(currentErrors + 1));
      
      if (currentErrors > 2) {
        sessionStorage.setItem('firestoreBlocked', 'true');
      }
      
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
    migrationAttemptedRef,
    firestoreErrorShownRef
  };
};
