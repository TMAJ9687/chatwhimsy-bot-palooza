
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
import { useDialogCleanup } from '@/hooks/useDialogCleanup';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '@/utils/performanceMonitor';
import { signOutUser } from '@/firebase/auth';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { handleDialogClose } = useDialogCleanup();
  const { onConfirm } = state.data;
  const { user, clearUser } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  const { cleanupOverlays } = useSafeDOMOperations();
  
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

  // Ensure cleanup happens on unmount
  useEffect(() => {
    return () => {
      if (isMountedRef.current) {
        cleanupOverlays();
      }
    };
  }, [cleanupOverlays]);

  const handleSafeClose = useCallback(() => {
    // Skip if already unmounted
    if (!isMountedRef.current) return;
    
    // First clean up any overlay elements
    cleanupOverlays();
    
    // Short delay before closing the dialog
    setTimeout(() => {
      if (isMountedRef.current) {
        handleDialogClose(closeDialog);
      }
    }, 50);
  }, [closeDialog, handleDialogClose, cleanupOverlays]);

  const handleConfirm = useCallback(async () => {
    // Prevent multiple clicks and skip if unmounted
    if (isNavigatingRef.current || !isMountedRef.current) return;
    isNavigatingRef.current = true;
    
    // First close the dialog
    handleSafeClose();
    
    // Track logout event for performance monitoring
    try {
      // Use a timeout to ensure dialog is fully closed before proceeding
      setTimeout(async () => {
        if (!isMountedRef.current) return;
        
        try {
          trackEvent('user-logout', async () => {
            if (!isMountedRef.current) return;
            
            if (onConfirm && typeof onConfirm === 'function') {
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
                  if (!isMountedRef.current) return;
                  
                  await adminLogout(); // Also run adminLogout for any app-specific cleanup
                  clearUser();
                  
                  // Cleanup before navigation
                  cleanupOverlays();
                  
                  // Only navigate if component is still mounted
                  if (isMountedRef.current) {
                    // Navigate to landing page after admin logout with a short delay
                    setTimeout(() => {
                      if (isMountedRef.current) {
                        navigate('/admin-login');
                        console.log('Admin logged out successfully');
                      }
                    }, 100);
                  }
                } catch (error) {
                  console.error('Error during admin logout:', error);
                  if (isMountedRef.current) {
                    isNavigatingRef.current = false;
                  }
                }
              } else {
                // Standard user logout - call onConfirm after cleanup
                cleanupOverlays();
                
                // Use timeout to ensure cleanup completes
                setTimeout(() => {
                  if (isMountedRef.current) {
                    onConfirm();
                    isNavigatingRef.current = false;
                  }
                }, 100);
              }
            }
          });
        } catch (error) {
          console.error('Error during logout:', error);
          if (isMountedRef.current) {
            isNavigatingRef.current = false;
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error during logout process:', error);
      if (isMountedRef.current) {
        isNavigatingRef.current = false;
      }
    }
  }, [onConfirm, handleSafeClose, user, isVip, isAdmin, adminLogout, navigate, clearUser, cleanupOverlays]);

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
