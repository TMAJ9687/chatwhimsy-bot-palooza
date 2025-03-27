
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
  const mounted = useRef(true);
  const [isVisible, setIsVisible] = useState(true);
  const { cleanupOverlays } = useSafeDOMOperations();

  // Enhanced cleanup with safety checks
  useEffect(() => {
    return () => {
      mounted.current = false;
      try {
        // Use our safe cleanup utility
        cleanupOverlays();
      } catch (error) {
        console.warn('Error during alert dialog cleanup:', error);
      }
    };
  }, [cleanupOverlays]);

  return (
    <DialogContent 
      className="sm:max-w-[425px]" 
      onEscapeKeyDown={onClose}
      onInteractOutside={(e) => {
        // Prevent closing when interacting outside during animations
        if (!isVisible) {
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
  const dialogRef = useRef<HTMLDivElement>(null);
  const { cleanupOverlays } = useSafeDOMOperations();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method with debounce and checks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Use requestAnimationFrame to ensure DOM operations happen in the next paint cycle
    requestAnimationFrame(() => {
      try {
        // Use our safe cleanup utility
        cleanupOverlays();
        
        // Then close the dialog after a short delay to allow animations to complete
        setTimeout(() => {
          closeDialog();
          // Reset closing state after the dialog should be fully closed
          setTimeout(() => {
            isClosingRef.current = false;
          }, 300);
        }, 10);
      } catch (error) {
        console.warn('Error closing dialog:', error);
        // Force close as fallback
        closeDialog();
        isClosingRef.current = false;
      }
    });
  }, [closeDialog, cleanupOverlays]);
  
  // Cleanup any DOM issues when mounting/unmounting
  useEffect(() => {
    return () => {
      // Use our safe cleanup utility when unmounting
      cleanupOverlays();
    };
  }, [cleanupOverlays]);
  
  // Handle unexpected changes to Dialog visibility
  useEffect(() => {
    if (!isOpen && isClosingRef.current) {
      // Dialog was closed by something other than our handler
      setTimeout(() => {
        isClosingRef.current = false;
      }, 300);
    }
  }, [isOpen]);
  
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
