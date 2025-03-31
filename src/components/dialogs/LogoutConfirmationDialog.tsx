
import React, { useCallback } from 'react';
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

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { user } = useUser();
  const { isAdmin } = useAdmin();
  const { performLogout } = useLogout();
  
  const isVip = user?.isVip || false;

  const handleConfirm = useCallback(async () => {
    console.log('Logout confirmed, beginning process');
    
    // Close the dialog immediately before logout actions
    closeDialog();
    
    // Wait a moment for dialog to fully close before continuing
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Proceed with logout
    try {
      console.log('Executing logout directly');
      performLogout();
    } catch (error) {
      console.error('Failed during logout confirmation:', error);
    }
  }, [closeDialog, performLogout]);

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
      onOpenChange={(open) => !open && closeDialog()}
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
            data-testid="confirm-logout"
          >
            Yes, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
