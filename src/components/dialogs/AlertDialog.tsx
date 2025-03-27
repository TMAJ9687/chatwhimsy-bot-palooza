
import React, { memo } from 'react';
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
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  if (!isOpen) return null;

  const { title, message } = state.data;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && closeDialog()}>
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
