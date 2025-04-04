
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
      
      // Clean up localStorage items
      localStorage.removeItem('chatUser');
      localStorage.removeItem('vipProfileComplete');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('adminData');
      
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
      
      // Navigate to the appropriate page based on user type
      // Use navigate for a cleaner approach instead of window.location
      const destination = !isVip ? '/feedback' : '/';
      console.log(`Logout complete, navigating to ${destination}`);
      
      // Use navigate with replace to prevent back navigation after logout
      navigate(destination, { replace: true });
      
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback logout approach if the main one fails
      try {
        clearUser();
        navigate(!isVip ? '/feedback' : '/', { replace: true });
      } catch (e) {
        console.error('Fallback logout also failed', e);
        window.location.reload();
      }
    }
  }, [user, isVip, clearUser, navigate]);

  return { performLogout };
};

export default useLogout;
