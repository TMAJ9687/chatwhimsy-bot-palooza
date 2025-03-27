
import React, { memo, useCallback, useEffect } from 'react';
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
  // Automatically clean up any DOM issues when unmounting
  useEffect(() => {
    return () => {
      try {
        // Safe cleanup when dialog closes
        document.body.style.overflow = 'auto';
      } catch (error) {
        console.warn('Error during alert dialog cleanup:', error);
      }
    };
  }, []);

  return (
    <DialogContent className="sm:max-w-[425px]">
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
  
  // Optimization: use requestAnimationFrame for smoother closing with safety checks
  const handleClose = useCallback(() => {
    // Ensure body scrolling is restored
    document.body.style.overflow = 'auto';
    
    requestAnimationFrame(() => {
      try {
        closeDialog();
      } catch (error) {
        console.warn('Error closing dialog:', error);
        // Force close as fallback
        closeDialog();
      }
    });
  }, [closeDialog]);
  
  if (!isOpen) return null;

  const { title, message } = state.data;

  return (
    <Dialog open={true} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent
        title={title}
        message={message}
        onClose={handleClose}
      />
    </Dialog>
  );
};

export default memo(AlertDialogComponent);
