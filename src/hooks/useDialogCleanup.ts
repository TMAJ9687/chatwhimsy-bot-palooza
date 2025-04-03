
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { state, clearOverlays } = useUIState();
  
  // Clean up on unmount with enhanced safety checks
  useEffect(() => {
    return () => {
      if (isClosingRef.current) {
        // Use context-based overlay cleanup
        clearOverlays();
      }
    };
  }, [clearOverlays]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    isClosingRef.current = true;
    
    // Run the close dialog function
    if (typeof closeDialog === 'function') {
      try {
        closeDialog();
      } catch (e) {
        console.warn('Error in closeDialog function:', e);
      }
    }
    
    // Clear overlays after a small delay to ensure smooth animations
    const timeoutId = setTimeout(() => {
      if (isClosingRef.current) {
        clearOverlays();
      }
    }, 100);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [clearOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef,
    uiStateAvailable: true // Always available since we're using the hook
  };
};

export default useDialogCleanup;
