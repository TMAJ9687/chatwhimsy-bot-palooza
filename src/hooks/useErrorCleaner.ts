
import { useEffect } from 'react';

/**
 * Hook to help clean up DOM elements when errors occur
 * @param cleanupFn Function to call when an error is detected
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  useEffect(() => {
    // Handle runtime errors
    const handleError = (event: ErrorEvent) => {
      if (
        event.message && 
        (
          event.message.includes('removeChild') || 
          event.message.includes('appendChild') || 
          event.message.includes('not a child')
        )
      ) {
        console.log('[useErrorCleaner] Caught DOM error:', event.message);
        
        // Run the cleanup function
        cleanupFn();
        
        // Prevent the default error handling
        event.preventDefault();
        return false;
      }
    };
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      if (
        errorMessage.includes('removeChild') || 
        errorMessage.includes('appendChild') || 
        errorMessage.includes('not a child')
      ) {
        console.log('[useErrorCleaner] Caught unhandled promise rejection:', errorMessage);
        
        // Run the cleanup function
        console.log('[useErrorCleaner] Performing emergency DOM cleanup');
        cleanupFn();
        
        // Prevent the default error handling
        event.preventDefault();
        return false;
      }
    };
    
    // Register the error handlers
    window.addEventListener('error', handleError, { capture: true });
    window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    
    // Clean up the error handlers when the component unmounts
    return () => {
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    };
  }, [cleanupFn]);
};

export default useErrorCleaner;
