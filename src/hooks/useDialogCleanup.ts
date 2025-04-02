import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';

/**
 * Hook to safely clean up dialogs
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  
  // Safely access UIState context, handling cases where it might not be available
  let clearOverlays = () => {
    // Default no-op if context is not available
    console.warn('UIStateContext not available, using fallback cleanup');
    
    // Fallback: try to reset body state directly
    if (typeof document !== 'undefined' && document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
    }
  };
  
  // Try to access the UIState context
  try {
    const uiState = useUIState();
    if (uiState && uiState.clearOverlays) {
      clearOverlays = uiState.clearOverlays;
    }
  } catch (error) {
    console.warn('Error accessing UIStateContext:', error);
    // Keep using the fallback if context is unavailable
  }
  
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
