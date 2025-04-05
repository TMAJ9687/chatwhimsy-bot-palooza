
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
  const cleanupInProgressRef = useRef(false);
  const { clearOverlays } = useUIState();
  const { cleanupOverlays, isDOMReady } = useSafeDOMOperations();
  
  // Track component mounted state with improved safety
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
      
      // If we were closing when unmounted, ensure cleanup completes
      if (isClosingRef.current && !cleanupInProgressRef.current && isDOMReady()) {
        cleanupInProgressRef.current = true;
        
        // Use try/catch blocks for each cleanup step
        const performFinalCleanup = () => {
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
          
          // Reset body styles directly as a last resort with safety checks
          try {
            if (document.body) {
              document.body.style.overflow = '';
              document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
            }
          } catch (e) {
            console.warn('Error resetting body styles:', e);
          }
          
          cleanupInProgressRef.current = false;
        };
        
        // Use requestAnimationFrame for better reliability
        // but wrapped in a zero-timeout to ensure it runs after the current execution context
        setTimeout(() => {
          if (isDOMReady()) {
            requestAnimationFrame(performFinalCleanup);
          }
        }, 0);
      }
    };
  }, [clearOverlays, cleanupOverlays, isDOMReady]);
  
  const handleDialogClose = useCallback((closeDialog: () => void) => {
    // Skip if already unmounted or cleanup is in progress
    if (!isMountedRef.current || cleanupInProgressRef.current) return;
    
    isClosingRef.current = true;
    
    // Clean up any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Run the close dialog function with error handling
    if (typeof closeDialog === 'function') {
      try {
        closeDialog();
      } catch (e) {
        console.warn('Error in closeDialog function:', e);
      }
    }
    
    // Clear overlays after a small delay to ensure smooth animations
    // Only if component is still mounted and with better cleanup logic
    if (!cleanupInProgressRef.current) {
      cleanupInProgressRef.current = true;
      
      // Use requestAnimationFrame for better sync with rendering cycle
      // but wrapped in a zero-timeout to avoid blocking current execution
      setTimeout(() => {
        if (!isMountedRef.current) {
          cleanupInProgressRef.current = false;
          return;
        }
        
        requestAnimationFrame(() => {
          timeoutRef.current = setTimeout(() => {
            if (!isMountedRef.current) {
              cleanupInProgressRef.current = false;
              return;
            }
            
            if (isClosingRef.current) {
              // First try React-based cleanup
              try {
                clearOverlays();
              } catch (e) {
                console.warn('Delayed clearOverlays error:', e);
              }
              
              // Then try DOM-based cleanup as fallback with shorter delay
              timeoutRef.current = setTimeout(() => {
                if (isMountedRef.current) {
                  try {
                    cleanupOverlays();
                  } catch (e) {
                    console.warn('Delayed cleanupOverlays error:', e);
                  }
                  
                  cleanupInProgressRef.current = false;
                  timeoutRef.current = null;
                }
              }, 50); // Shorter timeout to ensure cleanup happens promptly
            } else {
              cleanupInProgressRef.current = false;
            }
          }, 100); // Short delay after animation frame
        });
      }, 0);
    }
    
    // Return cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      cleanupInProgressRef.current = false;
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
