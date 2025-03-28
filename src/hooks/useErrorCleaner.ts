
import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  // Create a memoized error handler
  const handleError = useCallback((error: ErrorEvent) => {
    const errorMessage = error.message || '';
    
    // Check for DOM manipulation errors
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('parentNode') || 
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('not a child of this node')
    ) {
      console.warn('DOM error detected, running cleanup:', errorMessage);
      
      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        cleanupFn();
        
        // For this specific error, perform additional cleanup steps
        if (errorMessage.includes('not a child of this node')) {
          try {
            // Clean up any overlay elements still in the DOM
            document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
              .forEach(element => {
                try {
                  if (element.parentNode) {
                    element.parentNode.removeChild(element);
                  }
                } catch (e) {
                  // Ignore errors during emergency cleanup
                }
              });
            
            // Reset body state
            if (document.body) {
              document.body.style.overflow = 'auto';
              document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
            }
          } catch (e) {
            console.warn('Error during emergency cleanup:', e);
          }
        }
      });
    }
  }, [cleanupFn]);
  
  useEffect(() => {
    // Add error handler
    window.addEventListener('error', handleError);
    
    // Add unhandled rejection handler for promises
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      if (
        errorMessage.includes('removeChild') || 
        errorMessage.includes('parentNode') || 
        errorMessage.includes('not a child')
      ) {
        console.warn('Promise rejection with DOM error detected:', errorMessage);
        requestAnimationFrame(cleanupFn);
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [handleError, cleanupFn]);
};
