
import { useEffect } from "react";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  useEffect(() => {
    const handleError = (error: ErrorEvent) => {
      if (error.message && (
        error.message.includes('removeChild') || 
        error.message.includes('parentNode') || 
        error.message.includes('Cannot read properties of null')
      )) {
        console.warn('DOM error detected, running cleanup:', error.message);
        
        // Use setTimeout to avoid potential event loop congestion
        setTimeout(() => {
          cleanupFn();
        }, 0);
      }
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [cleanupFn]);
};
