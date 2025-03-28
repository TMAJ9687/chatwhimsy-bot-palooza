
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
import { signOutUser } from '@/firebase/auth';
import { useDialogCleanup } from '@/hooks/useDialogCleanup';
import { useLogout } from '@/hooks/useLogout';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { onConfirm } = state.data || {}; // Handle potential undefined state.data
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
    
    handleDialogClose(() => closeDialog());
  }, [closeDialog, handleDialogClose]);

  const handleConfirm = useCallback(async () => {
    // Prevent multiple clicks and skip if unmounted
    if (isNavigatingRef.current || !isMountedRef.current) return;
    isNavigatingRef.current = true;
    
    // Close the dialog first
    handleSafeClose();
    
    // Use a timeout to ensure dialog is fully closed before proceeding
    setTimeout(() => {
      if (!isMountedRef.current) {
        isNavigatingRef.current = false;
        return;
      }
      
      // Use our centralized logout function
      performLogout(() => {
        // This callback runs after user state is cleared but before navigation
        if (onConfirm && typeof onConfirm === 'function') {
          try {
            onConfirm();
          } catch (error) {
            console.error('Error calling onConfirm callback', error);
          }
        }
      });
    }, 50);
  }, [onConfirm, handleSafeClose, performLogout]);

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
