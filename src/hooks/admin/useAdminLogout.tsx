
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminLogout as baseAdminLogout } from '@/services/admin/supabaseAdminAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for admin logout functionality with improved reliability
 */
export const useAdminLogout = (authLogout?: () => Promise<boolean>) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Create a wrapped adminLogout function that combines both auth methods
  const combinedAdminLogout = useCallback(async () => {
    try {
      let logoutSuccess = false;
      
      // First try the specialized admin logout if provided
      if (authLogout) {
        try {
          logoutSuccess = await authLogout();
          if (logoutSuccess) {
            console.log('Admin logout successful via provided authLogout function');
          }
        } catch (authError) {
          console.error('Error during specialized admin logout:', authError);
          // Continue to fallback
        }
      }
      
      // If specialized logout failed or wasn't provided, use base admin logout
      if (!logoutSuccess) {
        try {
          await baseAdminLogout();
          logoutSuccess = true;
          console.log('Admin logout successful via baseAdminLogout function');
        } catch (baseError) {
          console.error('Error during base admin logout:', baseError);
          throw baseError; // Re-throw for final error handling
        }
      }
      
      // Clean up any admin-related localStorage entries for extra safety
      try {
        localStorage.removeItem('adminEmail');
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminSession');
      } catch (storageError) {
        console.warn('Error clearing admin localStorage items:', storageError);
        // Non-critical error, continue
      }
      
      toast({
        title: 'Logout Successful',
        description: 'You have been logged out of the admin panel',
      });
      
      // Use navigate directly for React Router navigation
      navigate('/secretadminportal');
      
      return true;
    } catch (error) {
      console.error('Error during admin logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
      return false;
    }
  }, [authLogout, toast, navigate]);
  
  return {
    adminLogout: combinedAdminLogout
  };
};
