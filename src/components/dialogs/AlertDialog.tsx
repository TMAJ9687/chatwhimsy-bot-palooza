
import React, { memo, useCallback, useEffect, useRef } from 'react';
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
  const mounted = useRef(true);

  // Enhanced cleanup with safety checks
  useEffect(() => {
    return () => {
      mounted.current = false;
      try {
        // Safe cleanup when dialog closes
        requestAnimationFrame(() => {
          if (document.body) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('overflow-hidden');
          }
        });
      } catch (error) {
        console.warn('Error during alert dialog cleanup:', error);
      }
    };
  }, []);

  return (
    <DialogContent className="sm:max-w-[425px]" onEscapeKeyDown={onClose}>
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
  const isClosingRef = useRef(false);
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method with debounce and checks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Ensure body scrolling is restored
    requestAnimationFrame(() => {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden');
      }
      
      try {
        closeDialog();
        // Reset closing state after a delay
        setTimeout(() => {
          isClosingRef.current = false;
        }, 300);
      } catch (error) {
        console.warn('Error closing dialog:', error);
        // Force close as fallback
        closeDialog();
        isClosingRef.current = false;
      }
    });
  }, [closeDialog]);
  
  // Cleanup any DOM issues when unmounting
  useEffect(() => {
    return () => {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden');
      }
    };
  }, []);
  
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
