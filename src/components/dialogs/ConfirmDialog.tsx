
import React, { memo, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { useDialog } from '@/context/DialogContext';

// Memoized dialog content component for better performance
const ConfirmDialogContent = memo(({
  title,
  message,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}) => {
  return (
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{message}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel asChild>
          <Button variant="outline" onClick={onCancel} type="button">
            Cancel
          </Button>
        </AlertDialogCancel>
        <AlertDialogAction asChild>
          <Button variant="destructive" onClick={onConfirm} type="button">
            Confirm
          </Button>
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );
});

ConfirmDialogContent.displayName = 'ConfirmDialogContent';

const ConfirmDialog = () => {
  const { state, closeDialog } = useDialog();
  
  // Only destructure when needed
  const isOpen = state.isOpen && state.type === 'confirm';
  
  if (!isOpen) return null;

  const { title, message, onConfirm } = state.data;

  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      // Use requestAnimationFrame to prevent UI freeze
      requestAnimationFrame(() => {
        onConfirm();
        closeDialog();
      });
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={(open) => !open && closeDialog()}>
      <ConfirmDialogContent
        title={title}
        message={message}
        onConfirm={handleConfirm}
        onCancel={closeDialog}
      />
    </AlertDialog>
  );
};

export default memo(ConfirmDialog);
