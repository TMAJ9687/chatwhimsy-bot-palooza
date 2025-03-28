
import { useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { signOutUser } from '@/firebase/auth';

/**
 * Hook that provides logout functionality with proper redirection
 * This hook should only be used within components that are descendants of UserProvider
 */
export const useLogout = () => {
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const isVip = user?.isVip || false;
  
  const performLogout = useCallback(async (callback?: () => void) => {
    try {
      console.log('Starting logout process...');
      // Store user type in localStorage for redirect after logout
      if (user) {
        try {
          localStorage.setItem('chatUser', JSON.stringify({
            isVip: isVip
          }));
        } catch (e) {
          console.error('Error storing user type:', e);
        }
      }
      
      // First clear all DOM state and fix any potential issues
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      // Clean up potential overlay elements
      try {
        document.querySelectorAll('.fixed.inset-0').forEach(el => {
          try {
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          } catch (e) {
            // Ignore errors during emergency cleanup
          }
        });
      } catch (e) {
        // Ignore any DOM errors during cleanup
      }
      
      // If user is admin, perform admin logout
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        await signOutUser(); // Use the Firebase signOut directly
        await adminLogout(); // Also run adminLogout for any app-specific cleanup
        clearUser();
        
        // Use window.location for a full page reload to avoid DOM state issues
        window.location.href = '/admin-login';
        console.log('Admin logged out successfully');
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
        
        // For standard users, we let the calling code handle navigation
        // This ensures the logout dialog can properly close first
        console.log(`Standard user logout complete. isVip=${isVip}`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback logout approach if the main one fails
      try {
        console.log('Attempting fallback logout approach');
        clearUser();
        // In case of error, always redirect to home
        window.location.href = '/';
      } catch (e) {
        console.error('Fallback logout also failed', e);
      }
    }
  }, [user, isVip, isAdmin, adminLogout, clearUser]);

  return { performLogout };
};
