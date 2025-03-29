import { useCallback, useEffect, useRef } from 'react';
import { UserProfile } from '@/types/user';
import { saveVipUserProfile, getVipUserProfile } from '@/firebase/firestore';

export const useUserStorage = (
  user: UserProfile | null,
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>
) => {
  const profileSyncedRef = useRef(false);
  const profileUpdateInProgressRef = useRef(false);
  const profileUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userLoadAttemptedRef = useRef(false);
  const firestoreSyncRef = useRef(false);

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
      const storedUser = localStorage.getItem('chatUser');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          if (parsedUser && parsedUser.isVip === undefined) {
            parsedUser.isVip = false;
          }
          
          console.log('Loaded user from localStorage:', parsedUser.nickname, 'isVip:', parsedUser.isVip);
          setUser(parsedUser);
          
          if (parsedUser.isVip && !firestoreSyncRef.current && parsedUser.id) {
            firestoreSyncRef.current = true;
            
            const loadVipUser = async () => {
              try {
                const firestoreUser = await getVipUserProfile(parsedUser.id);
                
                if (firestoreUser) {
                  console.log('Loaded VIP user from Firestore:', firestoreUser.nickname);
                  
                  setUser(firestoreUser);
                  
                  localStorage.setItem('chatUser', JSON.stringify(firestoreUser));
                  
                  if (firestoreUser.gender && firestoreUser.age && firestoreUser.country) {
                    localStorage.setItem('vipProfileComplete', 'true');
                  }
                } else {
                  console.log('VIP user not found in Firestore, will save on next update');
                }
              } catch (error) {
                console.error('Error loading VIP user from Firestore:', error);
              }
            };
            
            loadVipUser();
          }
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
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
  }, [user, setUser]);

  const updateUserProfile = useCallback(async (profile: Partial<UserProfile>) => {
    if (profileUpdateInProgressRef.current) {
      console.warn('Profile update already in progress, queuing update');
      setTimeout(() => updateUserProfile(profile), 100);
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
        profileSyncedRef.current = true;
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

  return { updateUserProfile };
};

export default useUserStorage;
