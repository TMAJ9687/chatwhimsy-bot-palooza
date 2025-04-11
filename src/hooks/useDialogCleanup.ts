
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const isMountedRef = useRef(true);
  const { clearOverlays } = useUIState();
  const { cleanupOverlays, isDOMReady } = useSafeDOMOperations();
  
  // Track component mounted state with improved safety
  useEffect(() => {
    isMountedRef.current = true;
    
    // Clean up on unmount with enhanced safety checks
    return () => {
      isMountedRef.current = false;
      
      // If we were closing when unmounted, ensure cleanup completes
      if (isClosingRef.current && isDOMReady()) {
        // Use React state management instead of direct DOM manipulation where possible
        try {
          clearOverlays();
        } catch (e) {
          console.warn('Error during dialog cleanup (clearOverlays):', e);
        }
        
        // Last resort body style reset via cleanup function
        try {
          cleanupOverlays();
        } catch (e) {
          console.warn('Error during dialog cleanup (cleanupOverlays):', e);
        }
      }
    };
  }, [clearOverlays, cleanupOverlays, isDOMReady]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    // Skip if already unmounted
    if (!isMountedRef.current) return;
    
    isClosingRef.current = true;
    
    // Run the close dialog function with error handling
    if (typeof closeDialog === 'function') {
      try {
        closeDialog();
      } catch (e) {
        console.warn('Error in closeDialog function:', e);
      }
    }
    
    // Clear overlays through React state management
    try {
      clearOverlays();
    } catch (e) {
      console.warn('Error in clearOverlays:', e);
    }
    
    // Return cleanup function
    return () => {
      isClosingRef.current = false;
    };
  }, [clearOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef,
    isMountedRef,
    uiStateAvailable: true
  };
};

export default useDialogCleanup;
