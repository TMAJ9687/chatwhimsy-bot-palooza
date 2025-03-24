
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
  
  const {
    title = 'Confirm Action',
    description = 'Are you sure you want to proceed with this action?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
    onConfirm
  } = state.data || {};

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
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className={destructive ? 'bg-red-500 hover:bg-red-600 text-white' : undefined}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationDialog;
