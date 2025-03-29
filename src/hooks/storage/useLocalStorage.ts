
import { useRef, useCallback } from 'react';
import { UserProfile } from '@/types/user';

export const useLocalStorage = () => {
  const userLoadAttemptedRef = useRef(false);

  const loadUserFromLocalStorage = useCallback((): UserProfile | null => {
    try {
      const storedUser = localStorage.getItem('chatUser');
      
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        
        if (parsedUser && parsedUser.isVip === undefined) {
          parsedUser.isVip = false;
        }
        
        console.log('Loaded user from localStorage:', parsedUser.nickname, 'isVip:', parsedUser.isVip);
        return parsedUser;
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
    }
    
    return null;
  }, []);

  const saveUserToLocalStorage = useCallback((profile: UserProfile): void => {
    try {
      localStorage.setItem('chatUser', JSON.stringify(profile));
      
      if (profile.isVip && 
          profile.gender && 
          profile.age && 
          profile.country) {
        localStorage.setItem('vipProfileComplete', 'true');
      }
    } catch (error) {
      console.error('Error saving user to localStorage:', error);
    }
  }, []);

  return {
    loadUserFromLocalStorage,
    saveUserToLocalStorage,
    userLoadAttemptedRef
  };
};
