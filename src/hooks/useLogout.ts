
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
      
      // Set logout event to trigger listeners and prevent automatic relogin
      localStorage.setItem('logoutEvent', Date.now().toString());
      
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
      
      // Clear storage systematically
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('adminEmail'); // Also clear admin email
      
      // If user is admin, perform admin logout
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        await signOutUser(); // Use the Firebase signOut directly
        await adminLogout(); // Also run adminLogout for any app-specific cleanup
        clearUser();
        
        // Use window.location for a full page reload to avoid DOM state issues
        window.location.href = '/secretadminportal';
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
        
        // Force a hard redirect based on user type
        const destination = isVip ? '/' : '/feedback';
        window.location.href = destination;
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
