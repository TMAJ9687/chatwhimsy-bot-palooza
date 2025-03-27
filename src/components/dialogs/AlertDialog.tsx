
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const { cleanupOverlays, registerNode } = useSafeDOMOperations();

  // Register the content element for tracking
  useEffect(() => {
    if (contentRef.current) {
      registerNode(contentRef.current);
    }
    
    return () => {
      mounted.current = false;
    };
  }, [registerNode]);

  // Enhanced cleanup with safety checks
  useEffect(() => {
    return () => {
      try {
        // Use our safe cleanup utility on a delay to ensure proper cleanup order
        queueMicrotask(() => {
          if (!mounted.current) {
            cleanupOverlays();
          }
        });
      } catch (error) {
        console.warn('Error during alert dialog cleanup:', error);
      }
    };
  }, [cleanupOverlays]);

  return (
    <DialogContent 
      ref={contentRef}
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
  const { cleanupOverlays, registerNode } = useSafeDOMOperations();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Register the dialog element
  useEffect(() => {
    if (dialogRef.current) {
      registerNode(dialogRef.current);
    }
  }, [registerNode]);
  
  // Safer close method with improved timing
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Use queueMicrotask for more reliable timing than requestAnimationFrame
    queueMicrotask(() => {
      try {
        // Close the dialog first
        closeDialog();
        
        // Then clean up overlays after a short delay
        setTimeout(() => {
          cleanupOverlays();
          
          // Reset closing state after everything is done
          setTimeout(() => {
            isClosingRef.current = false;
          }, 300);
        }, 50);
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
      // Set a flag to prevent concurrent cleanup attempts
      isClosingRef.current = true;
      
      // Clean up with a delay to ensure proper order
      setTimeout(() => {
        cleanupOverlays();
      }, 50);
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
