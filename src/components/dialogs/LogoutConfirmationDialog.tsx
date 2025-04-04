
import React, { useCallback, useState } from 'react';
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
import { useLogout } from '@/hooks/useLogout';
import { LogOut } from 'lucide-react';
import LogoutErrorBoundary from '@/components/error/LogoutErrorBoundary';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isVip = user?.isVip || false;
  
  // Get the logout functionality from our centralized hook
  const { performLogout } = useLogout();

  const handleSafeClose = useCallback(() => {
    if (!isLoggingOut) {
      closeDialog();
    }
  }, [closeDialog, isLoggingOut]);

  const handleConfirm = useCallback(async () => {
    // Prevent multiple clicks
    if (isLoggingOut) return;
    
    try {
      setIsLoggingOut(true);
      
      // Close the dialog immediately for visual feedback
      handleSafeClose();
      
      // Use a timeout to ensure the dialog is closed before logout executes
      setTimeout(() => {
        // Perform the logout
        performLogout(() => {
          console.log('Logout callback executed');
        });
      }, 50);
      
    } catch (error) {
      console.error('Failed during logout confirmation:', error);
      setIsLoggingOut(false);
    }
  }, [handleSafeClose, performLogout, isLoggingOut]);

  const getFeedbackMessage = () => {
    if (isAdmin) {
      return "Are you sure you want to log out from the admin dashboard?";
    } else if (isVip) {
      return "Are you sure you want to leave? We'll miss you :(";
    } else {
      return "Before you go, would you like to share your feedback on the next screen?";
    }
  };

  // Wrap the entire component in our error boundary
  return (
    <LogoutErrorBoundary>
      <AlertDialog 
        open={state.isOpen && state.type === 'logout'} 
        onOpenChange={(open) => !open && handleSafeClose()}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-red-500" />
              <span>Leaving so soon?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {getFeedbackMessage()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>No, Stay</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={isLoggingOut}
            >
              {isLoggingOut ? 'Signing Out...' : 'Yes, Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </LogoutErrorBoundary>
  );
};

export default LogoutConfirmationDialog;
