
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { onConfirm } = state.data || {}; // Handle potential undefined state.data
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  // Get dialog cleanup utilities
  const { handleDialogClose, isClosingRef } = useDialogCleanup();
  
  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);
  
  // Track if navigation is in progress to prevent race conditions
  const isNavigatingRef = useRef(false);
  
  const isVip = user?.isVip || false;

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
    setTimeout(async () => {
      if (!isMountedRef.current) {
        isNavigatingRef.current = false;
        return;
      }
      
      try {
        // Store user type in localStorage for redirect after logout
        if (user) {
          try {
            localStorage.setItem('chatUser', JSON.stringify({
              isVip: isVip
            }));
          } catch (e) {
            console.error('Error storing user type:', e);
          }
        }
        
        // If user is admin, perform admin logout
        if (isAdmin) {
          try {
            await signOutUser(); // Use the Firebase signOut directly
            
            // Only continue if still mounted
            if (!isMountedRef.current) {
              isNavigatingRef.current = false;
              return;
            }
            
            await adminLogout(); // Also run adminLogout for any app-specific cleanup
            clearUser();
            
            // Use window.location for a full page reload to avoid DOM state issues
            window.location.href = '/admin-login';
            console.log('Admin logged out successfully');
          } catch (error) {
            console.error('Error during admin logout:', error);
            if (isMountedRef.current) {
              isNavigatingRef.current = false;
            }
          }
        } else {
          // Clear user data first
          clearUser();
          
          // Standard users go to feedback page, VIP users go to home
          if (!isVip) {
            console.log('Standard user logging out, redirecting to feedback');
            // Use window.location for more reliable navigation during cleanup
            window.location.href = '/feedback';
          } else {
            console.log('VIP user logging out, redirecting to home');
            window.location.href = '/';
          }
          
          // Call the onConfirm callback if it exists
          if (isMountedRef.current && onConfirm && typeof onConfirm === 'function') {
            try {
              onConfirm();
            } catch (error) {
              console.error('Error calling onConfirm callback', error);
            }
          }
        }
      } catch (error) {
        console.error('Error during logout:', error);
        if (isMountedRef.current) {
          isNavigatingRef.current = false;
        }
      }
    }, 50);
  }, [onConfirm, handleSafeClose, user, isVip, isAdmin, adminLogout, clearUser]);

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
