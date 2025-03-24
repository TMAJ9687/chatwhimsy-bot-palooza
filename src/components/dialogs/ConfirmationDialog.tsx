
import React from 'react';
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
import { useDialog } from '@/context/DialogContext';

const ConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  
  // Only render if dialog is open and of type 'confirmation'
  if (!state.isOpen || state.type !== 'confirmation') {
    return null;
  }
  
  const { title, description, confirmText, cancelText, onConfirm, danger } = state.data || {};

  const handleConfirm = () => {
    if (onConfirm && typeof onConfirm === 'function') {
      onConfirm();
    }
    closeDialog();
  };

  return (
    <AlertDialog open={true} onOpenChange={closeDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title || 'Confirm Action'}</AlertDialogTitle>
          <AlertDialogDescription>
            {description || 'Are you sure you want to continue?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText || 'Cancel'}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={danger ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
          >
            {confirmText || 'Continue'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
