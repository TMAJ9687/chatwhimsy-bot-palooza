
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
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
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

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
  const contentRef = useRef<HTMLDivElement>(null);
  const { registerNode } = useSafeDOMOperations();
  const mountedRef = useRef(true);

  // Register the content element for tracking
  useEffect(() => {
    if (contentRef.current) {
      registerNode(contentRef.current);
    }
    
    return () => {
      mountedRef.current = false;
    };
  }, [registerNode]);

  return (
    <DialogContent 
      ref={contentRef}
      className="sm:max-w-[425px]" 
      onEscapeKeyDown={onClose}
      onInteractOutside={(e) => {
        // Prevent closing during animations
        if (!mountedRef.current) {
          e.preventDefault();
        }
      }}
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
  const isClosingRef = useRef(false);
  const { cleanupOverlays } = useSafeDOMOperations();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Use queueMicrotask for reliable timing
    queueMicrotask(() => {
      // Close the dialog first
      closeDialog();
      
      // Then clean up overlays after a short delay
      setTimeout(() => {
        cleanupOverlays();
        
        // Reset closing state after everything is done
        setTimeout(() => {
          isClosingRef.current = false;
        }, 100);
      }, 50);
    });
  }, [closeDialog, cleanupOverlays]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isClosingRef.current = true;
    };
  }, []);
  
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
