
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
import { useDialog } from '@/hooks/useDialog';

// Memoized dialog content component to prevent unnecessary re-renders
const AlertDialogContent = memo(({
  title,
  message,
  onClose,
}: {
  title: string;
  message: string;
  onClose: () => void;
}) => {
  return (
    <DialogContent 
      className="sm:max-w-[425px]" 
      onEscapeKeyDown={onClose}
    >
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{message}</DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button onClick={onClose}>OK</Button>
      </DialogFooter>
    </DialogContent>
  );
});

AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogComponent = () => {
  const { state, closeDialog } = useDialog();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Simple close method
  const handleClose = useCallback(() => {
    closeDialog();
  }, [closeDialog]);
  
  if (!isOpen) return null;

  const { title, message } = state.data;

  return (
    <Dialog 
      open={true} 
      onOpenChange={(open) => !open && handleClose()}
      modal={true}
    >
      <AlertDialogContent
        title={title}
        message={message}
        onClose={handleClose}
      />
    </Dialog>
  );
};

export default memo(AlertDialogComponent);
