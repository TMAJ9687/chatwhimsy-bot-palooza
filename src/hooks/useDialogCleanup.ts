
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { clearOverlays } = useUIState();
  const { cleanupOverlays } = useSafeDOMOperations();
  
  // Clean up on unmount with enhanced safety checks
  useEffect(() => {
    return () => {
      // Cleanup any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (isClosingRef.current) {
        // Try both cleanup methods for better reliability
        clearOverlays();
        
        // Use the safe DOM operations for cleanup as a fallback
        // But don't use setTimeout since this is in cleanup
        try {
          cleanupOverlays();
        } catch (e) {
          console.warn('Error during dialog cleanup:', e);
        }
      }
    };
  }, [clearOverlays, cleanupOverlays]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    isClosingRef.current = true;
    
    // Clean up any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Run the close dialog function
    if (typeof closeDialog === 'function') {
      try {
        closeDialog();
      } catch (e) {
        console.warn('Error in closeDialog function:', e);
      }
    }
    
    // Clear overlays after a small delay to ensure smooth animations
    timeoutRef.current = setTimeout(() => {
      if (isClosingRef.current) {
        // First try React-based cleanup
        clearOverlays();
        
        // Then try DOM-based cleanup as fallback
        timeoutRef.current = setTimeout(() => {
          cleanupOverlays();
          timeoutRef.current = null;
        }, 50);
      }
    }, 100);
    
    // Return cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [clearOverlays, cleanupOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef,
    uiStateAvailable: true // Always available since we're using the hook
  };
};

export default useDialogCleanup;
