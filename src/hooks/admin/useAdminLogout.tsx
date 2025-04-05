
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { adminLogout as baseAdminLogout } from '@/services/admin/supabaseAdminAuth';

/**
 * Custom hook for admin logout functionality
 */
export const useAdminLogout = (authLogout?: () => Promise<boolean>) => {
  const { toast } = useToast();
  
  // Create a wrapped adminLogout function that combines both auth methods
  const combinedAdminLogout = useCallback(async () => {
    try {
      // First try the specialized admin logout
      if (authLogout) {
        const success = await authLogout();
        if (success) return true;
      }
      
      // Fallback to the imported admin logout
      await baseAdminLogout();
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
      return false;
    }
  }, [authLogout, toast]);
  
  return {
    adminLogout: combinedAdminLogout
  };
};
