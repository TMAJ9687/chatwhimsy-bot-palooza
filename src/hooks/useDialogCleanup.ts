
import { useCallback } from 'react';

/**
 * A simplified hook for dialog cleanup that focuses on core functionality
 */
export const useDialogCleanup = () => {
  // Safe close method with proper timing
  const handleDialogClose = useCallback((onClose: () => void) => {
    // Use a more direct approach to closing
    onClose();
  }, []);

  return {
    handleDialogClose
  };
};
