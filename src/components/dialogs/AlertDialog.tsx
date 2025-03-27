
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
  const animationFrameRef = useRef<number | null>(null);

  // Register the content element for tracking and cleanup
  useEffect(() => {
    if (contentRef.current) {
      registerNode(contentRef.current);
    }
    
    return () => {
      mountedRef.current = false;
      
      // Clear any pending animation frames
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [registerNode]);

  // Handle close with animation frame for better performance
  const handleClose = useCallback(() => {
    if (!mountedRef.current) return;
    
    // Cancel any pending animation
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Use requestAnimationFrame for smoother UI
    animationFrameRef.current = requestAnimationFrame(() => {
      animationFrameRef.current = null;
      if (mountedRef.current) {
        onClose();
      }
    });
  }, [onClose]);

  return (
    <DialogContent 
      ref={contentRef}
      className="sm:max-w-[425px]" 
      onEscapeKeyDown={handleClose}
      onInteractOutside={(e) => {
        // Prevent closing during animations and unmounts
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
        <Button onClick={handleClose}>OK</Button>
      </DialogFooter>
    </DialogContent>
  );
});

AlertDialogContent.displayName = 'AlertDialogContent';

const AlertDialogComponent = () => {
  const { state, closeDialog } = useDialog();
  const isClosingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const { cleanupOverlays } = useSafeDOMOperations();
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Enhanced close method with better timing
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Close the dialog first
    closeDialog();
    
    // Then clean up overlays after a short delay
    const timeoutId = setTimeout(() => {
      cleanupOverlays();
      
      // Reset closing state after everything is done
      const resetId = setTimeout(() => {
        isClosingRef.current = false;
      }, 150);
      
      timeoutsRef.current.push(resetId);
    }, 50);
    
    timeoutsRef.current.push(timeoutId);
  }, [closeDialog, cleanupOverlays]);
  
  // Cleanup on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isClosingRef.current = true;
      
      // Clear all timeouts
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
      
      // Final cleanup
      cleanupOverlays();
    };
  }, [cleanupOverlays]);
  
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
