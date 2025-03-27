
import React, { useCallback, useRef, useEffect } from 'react';
import { useDialog } from '@/context/DialogContext';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const LogoutConfirmationDialog = () => {
  const { state, closeDialog } = useDialog();
  const { onConfirm } = state.data;
  const isClosingRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);
  const { cleanupOverlays } = useSafeDOMOperations();

  // Clean up on unmount
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  const handleConfirm = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Close the dialog first
    closeDialog();
    
    // Then execute the callback after a short delay
    const timeoutId = setTimeout(() => {
      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm();
      }
      
      // Clean up overlays after the callback
      const cleanupTimeoutId = setTimeout(() => {
        cleanupOverlays();
        
        // Reset state
        isClosingRef.current = false;
      }, 100);
      
      timeoutsRef.current.push(cleanupTimeoutId);
    }, 50);
    
    timeoutsRef.current.push(timeoutId);
  }, [onConfirm, closeDialog, cleanupOverlays]);

  const handleCancel = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    closeDialog();
    
    // Clean up and reset state
    const timeoutId = setTimeout(() => {
      cleanupOverlays();
      isClosingRef.current = false;
    }, 100);
    
    timeoutsRef.current.push(timeoutId);
  }, [closeDialog, cleanupOverlays]);

  return (
    <AlertDialog 
      open={state.isOpen && state.type === 'logout'} 
      onOpenChange={(open) => {
        if (!open && !isClosingRef.current) {
          handleCancel();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leaving so soon?</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to leave? We'll miss you :(
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>No, Stay</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600"
          >
            Yes, Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutConfirmationDialog;
