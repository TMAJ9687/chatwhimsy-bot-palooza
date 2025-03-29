
import { useCallback, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { signOutUser } from '@/firebase/auth';
import { performDOMCleanup } from '@/utils/errorHandler';

/**
 * Hook that provides logout functionality with proper redirection
 * This hook should only be used within components that are descendants of UserProvider
 */
export const useLogout = () => {
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const isVip = user?.isVip || false;
  const logoutInProgressRef = useRef(false);
  
  const performLogout = useCallback(async (callback?: () => void) => {
    // Prevent multiple logout attempts
    if (logoutInProgressRef.current) {
      console.log('Logout already in progress, skipping');
      return;
    }
    
    logoutInProgressRef.current = true;
    
    try {
      console.log('Starting logout process...');
      
      // Set logout event to trigger listeners and prevent automatic relogin
      localStorage.setItem('logoutEvent', Date.now().toString());
      
      // First clean up DOM state to prevent React errors
      performDOMCleanup();
      
      // Clean up storage systematically
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('adminEmail');
      
      // Force a hard reload immediately with clear navigation target
      // This bypasses React's DOM manipulation issues
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        try {
          await signOutUser();
          await adminLogout();
          clearUser();
          
          // Use location.replace for cleaner navigation without history
          window.location.replace('/secretadminportal');
        } catch (adminError) {
          console.error('Error in admin logout:', adminError);
          window.location.replace('/secretadminportal');
        }
      } else {
        console.log('Standard user logout flow initiated');
        // Clear user data first
        clearUser();
        
        // Run the callback if one was provided
        if (callback && typeof callback === 'function') {
          try {
            callback();
          } catch (error) {
            console.error('Error calling callback during logout', error);
          }
        }
        
        // Use force reload approach to completely reset app state
        const destination = isVip ? '/' : '/feedback';
        console.log(`Navigating to ${destination} with force reload`);
        
        // Use location.replace for cleaner navigation and append cache-busting parameter
        window.location.replace(`${destination}?t=${Date.now()}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback logout - always navigate to home with forced reload
      try {
        clearUser();
        performDOMCleanup();
        
        console.log('Using fallback logout approach with force reload');
        window.location.href = '/?fallback=true';
        
        // Ensure page reloads if navigation doesn't happen immediately
        setTimeout(() => {
          window.location.reload();
        }, 100);
      } catch (e) {
        console.error('Fallback logout also failed', e);
        window.location.reload();
      } finally {
        logoutInProgressRef.current = false;
      }
    }
  }, [user, isVip, isAdmin, adminLogout, clearUser]);

  return { performLogout };
};
