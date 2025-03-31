
import { useCallback, useRef } from 'react';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { signOut } from '@/lib/supabase/supabaseAuth';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

/**
 * Hook that provides logout functionality with proper redirection
 * This hook should only be used within components that are descendants of UserProvider
 */
export const useLogout = () => {
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const isVip = user?.isVip || false;
  const logoutInProgressRef = useRef(false);
  
  /**
   * Simplified logout function that avoids DOM manipulations
   */
  const performLogout = useCallback(async (callback?: () => void) => {
    // Prevent multiple logout attempts
    if (logoutInProgressRef.current) {
      console.log('Logout already in progress, skipping');
      return;
    }
    
    logoutInProgressRef.current = true;
    
    try {
      console.log('Starting logout process...');
      
      // Set logout event to trigger listeners
      localStorage.setItem('logoutEvent', Date.now().toString());
      
      // First clear user data in context
      clearUser();
      
      // Handle admin logout
      if (isAdmin) {
        console.log('Admin logout flow initiated');
        try {
          // First sign out from Supabase
          await signOut();
          // Then execute admin-specific logout
          await adminLogout();
          
          // Show toast
          toast({
            title: 'Logout successful',
            description: 'You have been logged out from the admin panel',
          });
          
          // Navigate to admin login
          navigate('/secretadminportal', { replace: true });
        } catch (adminError) {
          console.error('Error in admin logout:', adminError);
          // Force navigation as fallback
          navigate('/secretadminportal', { replace: true });
        }
      } else {
        console.log('Standard user logout flow initiated');
        
        // Clean up storage
        localStorage.removeItem('chatUser');
        localStorage.removeItem('vipProfileComplete');
        localStorage.removeItem('temporaryUserToken');
        
        // Run the callback if one was provided
        if (callback && typeof callback === 'function') {
          try {
            callback();
          } catch (error) {
            console.error('Error calling callback during logout', error);
          }
        }
        
        // Sign out from Supabase (but continue regardless of result)
        try {
          await signOut();
        } catch (error) {
          console.warn('Non-critical error during Supabase signOut:', error);
        }
        
        // Show toast
        toast({
          title: 'Logout successful',
          description: 'You have been logged out',
        });
        
        // Navigate to appropriate destination
        const destination = isVip ? '/' : '/feedback';
        navigate(destination, { replace: true });
      }
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Fallback logout
      try {
        clearUser();
        navigate('/', { replace: true });
      } catch (e) {
        console.error('Fallback logout also failed', e);
        window.location.href = '/';
      } finally {
        logoutInProgressRef.current = false;
      }
    } finally {
      // Clean up flag after a delay to prevent rapid re-attempts
      setTimeout(() => {
        logoutInProgressRef.current = false;
      }, 500);
    }
  }, [user, isVip, isAdmin, adminLogout, clearUser, navigate]);

  return { performLogout };
};
