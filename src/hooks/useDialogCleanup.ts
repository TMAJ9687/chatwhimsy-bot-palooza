
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const isMountedRef = useRef(true);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { clearOverlays } = useUIState();
  const { cleanupOverlays, isDOMReady } = useSafeDOMOperations();
  
  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    
    // Clean up on unmount with enhanced safety checks
    return () => {
      isMountedRef.current = false;
      
      // Cleanup any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      
      if (isClosingRef.current && isDOMReady()) {
        // Try both cleanup methods for better reliability
        try {
          clearOverlays();
        } catch (e) {
          console.warn('Error during dialog cleanup (clearOverlays):', e);
        }
        
        try {
          cleanupOverlays();
        } catch (e) {
          console.warn('Error during dialog cleanup (cleanupOverlays):', e);
        }
        
        // Reset body styles directly as a last resort
        try {
          if (document.body) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
          }
        } catch (e) {
          console.warn('Error resetting body styles:', e);
        }
      }
    };
  }, [clearOverlays, cleanupOverlays, isDOMReady]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    // Skip if already unmounted
    if (!isMountedRef.current) return;
    
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
    // Only if component is still mounted
    if (isMountedRef.current) {
      timeoutRef.current = setTimeout(() => {
        if (isMountedRef.current && isClosingRef.current) {
          // First try React-based cleanup
          try {
            clearOverlays();
          } catch (e) {
            console.warn('Delayed clearOverlays error:', e);
          }
          
          // Then try DOM-based cleanup as fallback
          timeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              try {
                cleanupOverlays();
              } catch (e) {
                console.warn('Delayed cleanupOverlays error:', e);
              }
              timeoutRef.current = null;
            }
          }, 50);
        }
      }, 100);
    }
    
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
    isMountedRef,
    uiStateAvailable: true
  };
};

export default useDialogCleanup;
