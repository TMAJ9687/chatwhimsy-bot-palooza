
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
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';
import { useDialogCleanup } from '@/hooks/useDialogCleanup';

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
  const { handleDialogClose, isClosingRef } = useDialogCleanup();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method using our hook
  const handleClose = useCallback(() => {
    handleDialogClose(closeDialog);
  }, [closeDialog, handleDialogClose]);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Mark dialog as closing when component unmounts
      if (isClosingRef) {
        isClosingRef.current = true;
      }
    };
  }, [isClosingRef]);
  
  if (!isOpen) return null;

  const { title, message } = state.options || {};

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
