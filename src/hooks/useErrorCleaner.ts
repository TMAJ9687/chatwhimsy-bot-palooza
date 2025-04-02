
import { useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';
import { useErrorHandler } from './useErrorHandler';

/**
 * Hook to help clean up when errors occur - declarative replacement for DOM manipulation
 * @param cleanupFn Function to call when an error is detected
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  const { clearOverlays, clearError } = useUIState();
  
  // Use our error handler hook with a custom callback
  useErrorHandler({
    onError: () => {
      // Run the provided cleanup function
      if (typeof cleanupFn === 'function') {
        cleanupFn();
      }
      
      // Clear any open overlays
      clearOverlays();
      
      // Clear the error state
      clearError();
    }
  });
};

export default useErrorCleaner;
