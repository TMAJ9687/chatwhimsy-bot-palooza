
import React, { useCallback, useEffect, useRef } from 'react';
import { useDialog } from '@/context/DialogContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useDialogCleanup } from '@/hooks/useDialogCleanup';
import { useLogout } from '@/hooks/useLogout';
import { performDOMCleanup } from '@/utils/errorHandler';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  
  // Get dialog cleanup utilities
  const { handleDialogClose, isClosingRef } = useDialogCleanup();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track if navigation is in progress to prevent race conditions
  const isNavigatingRef = useRef(false);
  
  const isVip = user?.isVip || false;
  
  // Get the logout functionality from our centralized hook
  const { performLogout } = useLogout();

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSafeClose = useCallback(() => {
    // Skip if already unmounted
    if (!isMountedRef.current) return;
    
    console.log('Safely closing logout dialog');
    handleDialogClose(() => closeDialog());
  }, [closeDialog, handleDialogClose]);

  const handleConfirm = useCallback(async () => {
    // Prevent multiple clicks and skip if unmounted
    if (isNavigatingRef.current || !isMountedRef.current) {
      console.log('Already navigating or component unmounted, skipping logout');
      return;
    }
    
    console.log('Logout confirmed, beginning process');
    isNavigatingRef.current = true;
    
    // First do a DOM cleanup to prevent any overlay issues
    performDOMCleanup();
    
    // Close the dialog immediately for visual feedback
    handleSafeClose();
    
    // Add a delay to ensure dialog has time to fully close
    // before navigating, which helps prevent DOM race conditions
    setTimeout(async () => {
      if (!isMountedRef.current) {
        console.log('Component unmounted during delay, skipping logout');
        return;
      }
      
      try {
        console.log('Executing logout after dialog close delay');
        // Perform logout with extended timeouts
        await performLogout();
        
        // No need for further actions as performLogout now handles all cleanup and redirection
      } catch (error) {
        console.error('Failed during logout confirmation:', error);
        
        // If all else fails, try a direct reload
        if (isMountedRef.current) {
          console.log('Error during logout, forcing page reload');
          window.location.href = '/';
          setTimeout(() => {
            window.location.reload();
          }, 200);
        }
      }
    }, 300); // Significantly increased delay to ensure DOM updates complete
  }, [handleSafeClose, performLogout]);

  const getFeedbackMessage = () => {
    if (isAdmin) {
      return "Are you sure you want to log out from the admin dashboard?";
    } else if (isVip) {
      return "Are you sure you want to leave? We'll miss you :(";
    } else {
      return "Before you go, would you like to share your feedback on the next screen?";
    }
  };

  return (
    <AlertDialog 
      open={state.isOpen && state.type === 'logout'} 
      onOpenChange={(open) => !open && handleSafeClose()}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leaving so soon?</AlertDialogTitle>
          <AlertDialogDescription>
            {getFeedbackMessage()}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>No, Stay</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Yes, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
