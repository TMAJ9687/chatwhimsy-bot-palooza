import { useRef, useCallback, useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useSafeDOMOperations } from './useSafeDOMOperations';

/**
 * Hook to safely clean up dialogs
 */
export const useDialogCleanup = () => {
  const isClosingRef = useRef(false);
  const { cleanupOverlays: safeDOMCleanup } = useSafeDOMOperations();
  
  // Safely access UIState context, handling cases where it might not be available
  let clearOverlays = () => {
    // Default to using the DOM operations utility for cleanup
    console.log('Using fallback DOM cleanup');
    safeDOMCleanup();
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
    isClosingRef,
    uiStateAvailable
  };
};
