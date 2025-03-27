
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
import { useDialogCleanup } from '@/hooks/useDialogCleanup';
import { useUser } from '@/context/UserContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useNavigate } from 'react-router-dom';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { handleDialogClose } = useDialogCleanup();
  const { onConfirm } = state.data;
  const { user } = useUser();
  const { adminLogout, isAdmin } = useAdmin();
  const navigate = useNavigate();
  
  const isVip = user?.isVip || false;

  const handleSafeClose = useCallback(() => {
    handleDialogClose(closeDialog);
  }, [closeDialog, handleDialogClose]);

  const handleConfirm = useCallback(() => {
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
      
      // If user is admin, also perform admin logout
      if (isAdmin) {
        adminLogout();
        // Navigate to landing page after admin logout
        navigate('/');
      }
      
      onConfirm();
    }
    handleSafeClose();
  }, [onConfirm, handleSafeClose, user, isVip, isAdmin, adminLogout, navigate]);

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
