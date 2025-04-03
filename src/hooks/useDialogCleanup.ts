
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { clearOverlays } = useUIState();
  const { cleanupOverlays } = useSafeDOMOperations();
  
  // Clean up on unmount with enhanced safety checks
  useEffect(() => {
    return () => {
      if (isClosingRef.current) {
        // Try both cleanup methods for better reliability
        clearOverlays();
        
        // Use the safe DOM operations for cleanup as a fallback
        setTimeout(() => {
          cleanupOverlays();
        }, 50);
      }
    };
  }, [clearOverlays, cleanupOverlays]);
  
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
        
        // Fallback to DOM-based cleanup
        setTimeout(() => {
          cleanupOverlays();
        }, 50);
      }
    }, 100);
    
    // Return cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [clearOverlays, cleanupOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef,
    uiStateAvailable: true // Always available since we're using the hook
  };
};

export default useDialogCleanup;
