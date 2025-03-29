
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
      localStorage.removeItem('adminEmail'); // Also clear admin email
      
      // If user is admin, perform admin logout
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        try {
          await signOutUser(); // Use the Firebase signOut directly
          await adminLogout(); // Also run adminLogout for any app-specific cleanup
          clearUser();
          
          // Use window.location for a full page reload to avoid DOM state issues
          window.location.href = '/secretadminportal';
          console.log('Admin logged out successfully');
        } catch (adminError) {
          console.error('Error in admin logout:', adminError);
          // Force navigation even if there's an error
          window.location.href = '/secretadminportal';
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
        
        // Force a hard redirect based on user type with a small delay
        // to ensure React has completed unmounting operations
        setTimeout(() => {
          const destination = isVip ? '/' : '/feedback';
          // Use href to ensure a full page navigation
          window.location.href = destination;
          console.log(`Standard user logout complete. isVip=${isVip}`);
        }, 300); // Increased delay significantly to ensure cleanup completes
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback logout approach if the main one fails
      try {
        console.log('Attempting fallback logout approach');
        clearUser();
        performDOMCleanup(); // Additional cleanup
        
        // In case of error, always redirect to home with a forced reload
        setTimeout(() => {
          window.location.href = '/';
          // Force a reload after a short delay
          setTimeout(() => {
            window.location.reload();
          }, 100);
        }, 200);
      } catch (e) {
        console.error('Fallback logout also failed', e);
        // Last resort - force reload
        window.location.reload();
      } finally {
        logoutInProgressRef.current = false;
      }
    }
  }, [user, isVip, isAdmin, adminLogout, clearUser]);

  return { performLogout };
};
