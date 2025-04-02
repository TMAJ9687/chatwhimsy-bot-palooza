
import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs with enhanced error handling
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { cleanupOverlays: safeDOMCleanup } = useSafeDOMOperations();
  
  // Safely access UIState context, handling cases where it might not be available
  let clearOverlays = () => {
    // Default to using the DOM operations utility for cleanup
    console.log('Using fallback DOM cleanup');
    safeDOMCleanup();
    
    // Additional direct body cleanup as a final fallback
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    }
  };
  
  // Try to access the UIState context
  let uiStateAvailable = false;
  try {
    const uiState = useUIState();
    if (uiState && uiState.clearOverlays) {
      clearOverlays = uiState.clearOverlays;
      uiStateAvailable = true;
    }
  } catch (error) {
    console.warn('UIStateContext not available, using fallback cleanup mechanism');
    // Keep using the fallback if context is unavailable
  }
  
  // Clean up on unmount with enhanced safety checks
  useEffect(() => {
    return () => {
      if (isClosingRef.current) {
        // First try context-based cleanup
        try {
          clearOverlays();
        } catch (e) {
          console.warn('Error during context-based cleanup, using direct DOM cleanup');
          
          // Direct DOM cleanup as fallback
          if (document.body) {
            document.body.style.overflow = 'auto';
            document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
          }
          
          // Try to remove common overlay elements directly
          try {
            document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
              .forEach(el => {
                try {
                  // Extra safe removal
                  if (el.parentNode && document.contains(el) && 
                      Array.from(el.parentNode.childNodes).includes(el)) {
                    el.parentNode.removeChild(el);
                  }
                } catch (err) {
                  // Silently fail individual element removal
                }
              });
          } catch (err) {
            // Silently fail overlay removal
          }
        }
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
    
    // Immediate direct DOM cleanup
    try {
      if (document.body) {
        document.body.style.overflow = 'auto';
      }
    } catch (e) {
      // Silently fail body style reset
    }
    
    // Clear overlays after a small delay to ensure smooth animations
    // Use multiple timeouts at different intervals for more reliable cleanup
    const timeouts = [
      setTimeout(() => {
        if (isClosingRef.current) {
          try {
            clearOverlays();
          } catch (e) {
            console.warn('Error in delayed overlay cleanup:', e);
          }
        }
      }, 100),
      
      // Secondary cleanup as backup
      setTimeout(() => {
        if (document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        }
      }, 200)
    ];
    
    // Return cleanup function
    return () => {
      timeouts.forEach(id => clearTimeout(id));
    };
  }, [clearOverlays]);
  
  return {
    handleDialogClose,
    isClosingRef,
    uiStateAvailable
  };
};

export default useDialogCleanup;
