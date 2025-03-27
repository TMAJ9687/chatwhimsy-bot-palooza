
import { useCallback, useRef } from 'react';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook for safely closing dialogs and cleaning up related DOM elements
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { cleanupOverlays } = useSafeDOMOperations();
  
  // Safer close method with proper timing
  const handleDialogClose = useCallback((onClose: () => void) => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    
    // Use queueMicrotask for reliable timing
    queueMicrotask(() => {
      // Close the dialog first
      onClose();
      
      // Then clean up overlays after a short delay
      setTimeout(() => {
        cleanupOverlays();
        
        // Reset closing state after everything is done
        setTimeout(() => {
          isClosingRef.current = false;
        }, 100);
      }, 50);
    });
  }, [cleanupOverlays]);

  return {
    handleDialogClose,
    isClosingRef
  };
};
