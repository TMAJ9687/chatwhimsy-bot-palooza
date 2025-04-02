
import { useEffect } from 'react';
import { performDOMCleanup } from '@/utils/errorHandler';

interface ErrorHandlerOptions {
  onError?: () => void;
}

/**
 * Hook to handle errors and perform cleanup
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError } = options;
  
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      // Check if this is a DOM removal error
      if (
        event.message &&
        (event.message.includes('removeChild') || 
         event.message.includes('appendChild')) &&
        event.message.includes('not a child')
      ) {
        console.warn('Caught DOM manipulation error:', event.message);
        
        // Run cleanup
        performDOMCleanup();
        
        // Call the onError callback if provided
        if (onError) {
          onError();
        }
        
        // Prevent default behavior
        event.preventDefault();
        return false;
      }
    };
    
    // Handle unhandled promise rejections
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      if (
        errorMessage.includes('removeChild') || 
        errorMessage.includes('appendChild') || 
        errorMessage.includes('not a child')
      ) {
        console.warn('Unhandled promise rejection with DOM error:', errorMessage);
        
        // Run cleanup
        performDOMCleanup();
        
        // Call the onError callback if provided
        if (onError) {
          onError();
        }
        
        // Prevent default behavior
        event.preventDefault();
      }
    };
    
    // Register event listeners
    window.addEventListener('error', errorHandler, { capture: true });
    window.addEventListener('unhandledrejection', rejectionHandler, { capture: true });
    
    return () => {
      // Clean up event listeners
      window.removeEventListener('error', errorHandler, { capture: true });
      window.removeEventListener('unhandledrejection', rejectionHandler, { capture: true });
    };
  }, [onError]);
};

export default useErrorHandler;
