
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook that provides logout functionality with proper redirection
 * This hook should only be used within components that are descendants of UserProvider
 */
export const useLogout = () => {
  const { user, clearUser } = useUser();
  const navigate = useNavigate();
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
        const elements = document.querySelectorAll('.fixed.inset-0');
        elements.forEach(el => {
          try {
            // Always verify parent-child relationship before removal
            if (el.parentNode && Array.from(el.parentNode.childNodes).includes(el)) {
              el.parentNode.removeChild(el);
            }
          } catch (e) {
            // Ignore errors during emergency cleanup
            console.warn('Error removing overlay element:', e);
          }
        });
      } catch (e) {
        // Ignore any DOM errors during cleanup
        console.warn('Error during overlay cleanup:', e);
      }
      
      // Clear storage systematically
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('adminEmail');
      
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
      
      // Sign out from Supabase
      try {
        await supabase.auth.signOut();
      } catch (error) {
        console.error('Supabase signout error:', error);
      }
      
      // Force a hard redirect based on user type
      const destination = isVip ? '/' : '/feedback';
      console.log(`Standard user logout complete. isVip=${isVip}`);
      
      // Use window.location for a full page reload to avoid DOM state issues
      window.location.href = destination;
      
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
  }, [user, isVip, clearUser, navigate]);

  return { performLogout };
};

export default useLogout;
