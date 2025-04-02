
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';

/**
 * Hook to safely clean up dialogs
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { clearOverlays } = useUIState();
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isClosingRef.current) {
        clearOverlays();
      }
    };
  }, [clearOverlays]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    isClosingRef.current = true;
    
    // Run the close dialog function
    if (typeof closeDialog === 'function') {
      closeDialog();
    }
    
    // Clear overlays after a small delay to ensure smooth animations
    setTimeout(() => {
      if (isClosingRef.current) {
        clearOverlays();
      }
    }, 100);
  }, [clearOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef
  };
};
