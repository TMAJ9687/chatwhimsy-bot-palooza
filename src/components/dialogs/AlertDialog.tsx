
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

  // Enhanced cleanup with safety checks
  useEffect(() => {
    return () => {
      mounted.current = false;
      try {
        // Safe cleanup when dialog closes
        if (document.body) {
          // Use RAF to ensure we're not in the middle of a render cycle
          requestAnimationFrame(() => {
            if (document.body) {
              document.body.style.overflow = 'auto';
              document.body.classList.remove('overflow-hidden');
            }
          });
        }
      } catch (error) {
        console.warn('Error during alert dialog cleanup:', error);
      }
    };
  }, []);

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
  
  const isOpen = state.isOpen && state.type === 'alert';
  
  // Safer close method with debounce and checks
  const handleClose = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Ensure body scrolling is restored safely
    requestAnimationFrame(() => {
      try {
        // First, safely handle DOM updates
        if (document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden');
        }
        
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
  }, [closeDialog]);
  
  // Cleanup any DOM issues when mounting/unmounting
  useEffect(() => {
    return () => {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden');
      }
      
      // Clean up overlays that might be orphaned
      try {
        requestAnimationFrame(() => {
          document.querySelectorAll('.fixed.inset-0.z-50.bg-black\\/80').forEach(overlay => {
            if (overlay && overlay.parentNode && overlay.parentNode.contains(overlay)) {
              try {
                overlay.parentNode.removeChild(overlay);
              } catch (e) {
                // Ignore if already removed
                console.warn('Overlay already removed:', e);
              }
            }
          });
        });
      } catch (error) {
        console.warn('Error during overlay cleanup:', error);
      }
    };
  }, []);
  
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
