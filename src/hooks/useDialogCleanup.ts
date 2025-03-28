
import { useCallback, useRef } from 'react';

/**
 * A hook for dialog cleanup that handles both closing logic and tracks closing state
 */
export const useDialogCleanup = () => {
  // Reference to track if dialog is in the process of closing
  const isClosingRef = useRef(false);

  // Safe close method with proper timing
  const handleDialogClose = useCallback((onClose: () => void) => {
    // Set closing state to true
    isClosingRef.current = true;
    
    // Use a more direct approach to closing
    onClose();
    
    // Reset the closing state after a short delay
    setTimeout(() => {
      isClosingRef.current = false;
    }, 300);
  }, []);

  return {
    handleDialogClose,
    isClosingRef
  };
};
