
import React, { memo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { useDialog } from '@/context/DialogContext';

const AlertDialogComponent = () => {
  const { state, closeDialog } = useDialog();
  
  // Check if this dialog is open
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Destructure data only when dialog is open to avoid undefined values
  const { title, message } = isOpen ? state.data : { title: '', message: '' };

  // If not open, render nothing
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeDialog()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={closeDialog}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default memo(AlertDialogComponent);
