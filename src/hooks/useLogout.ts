
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { safeLogError } from '@/utils/safeErrorHandler';

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
      
      // Clear user data first before any async operations
      clearUser();
      
      // Clean up localStorage items
      try {
        localStorage.removeItem('chatUser');
        localStorage.removeItem('vipProfileComplete');
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminData');
      } catch (error) {
        console.error('Error clearing localStorage:', error);
      }
      
      // Run the callback if one was provided
      if (callback && typeof callback === 'function') {
        try {
          callback();
        } catch (error) {
          safeLogError(error, 'Error calling callback during logout');
        }
      }
      
      // Sign out from Supabase in a non-blocking way
      const signOutPromise = supabase.auth.signOut().catch(error => {
        console.error('Supabase signout error:', error);
      });
      
      // Determine the destination based on user type
      const destination = !isVip ? '/feedback' : '/';
      console.log(`Logging out, navigating to ${destination}`);
      
      // Use navigate with replace to prevent back navigation after logout
      // Don't wait for Supabase signOut to complete to prevent hanging
      navigate(destination, { replace: true });
      
      // Complete the Supabase signOut in the background
      await signOutPromise;
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback logout approach if the main one fails
      try {
        clearUser();
        navigate(!isVip ? '/feedback' : '/', { replace: true });
      } catch (e) {
        console.error('Fallback logout also failed', e);
        window.location.href = '/';
      }
    }
  }, [user, isVip, clearUser, navigate]);

  return { performLogout };
};

export default useLogout;
