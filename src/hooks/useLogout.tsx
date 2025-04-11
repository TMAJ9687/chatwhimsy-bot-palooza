
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/context/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useModal } from '@/context/ModalContext';
import { useAdmin } from './useAdmin';

/**
 * Custom hook to handle user logout functionality
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const { clearUser, isAdmin } = useUser();
  const { closeModal } = useModal();
  const { toast } = useToast();
  const admin = useAdmin();
  
  const performLogout = useCallback(async (callback?: () => void) => {
    try {
      // Check if user is an admin
      if (isAdmin) {
        // Special admin logout handling
        console.log('Performing admin logout...');
        await admin.adminLogout();
        
        // Navigate to admin login after admin logout
        navigate('/secretadminportal');
        return true;
      }
      
      // Regular logout for all users
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw new Error(`Error during logout: ${error.message}`);
      }
      
      // Clear user state
      clearUser();
      
      // Close any open modals
      closeModal();
      
      toast({
        title: "Logged out",
        description: "You have been successfully signed out",
        duration: 3000
      });
      
      // Navigate to homepage after successful logout
      navigate('/');
      
      // Execute callback if provided
      if (callback && typeof callback === 'function') {
        callback();
      }
      
      return true;
    } catch (error) {
      console.error('Logout error:', error);
      
      toast({
        title: "Logout Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
      
      return false;
    }
  }, [navigate, clearUser, closeModal, toast, isAdmin, admin]);

  return { performLogout };
};
