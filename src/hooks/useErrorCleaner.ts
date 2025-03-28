
import { useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  // Track cleanup attempts to prevent loops
  const cleanupAttemptedRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  
  // Create a memoized error handler
  const handleError = useCallback((error: ErrorEvent) => {
    const errorMessage = error.message || '';
    const now = Date.now();
    
    // Only attempt cleanup if we haven't recently done so
    if (cleanupAttemptedRef.current && (now - lastCleanupTimeRef.current < 1000)) {
      console.log('Skipping redundant cleanup, already attempted recently');
      return;
    }
    
    // Check for DOM manipulation errors
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('parentNode') || 
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('not a child of this node')
    ) {
      console.warn('DOM error detected, running cleanup:', errorMessage);
      
      // Mark that we've attempted cleanup
      cleanupAttemptedRef.current = true;
      lastCleanupTimeRef.current = now;
      
      // Use queueMicrotask for more reliable timing with DOM operations
      queueMicrotask(() => {
        // For removeChild errors, we need special handling
        if (errorMessage.includes('removeChild') || errorMessage.includes('not a child')) {
          try {
            // Ensure body is in a clean state first
            if (document.body) {
              document.body.style.overflow = 'auto';
              document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
            }
            
            // Do a more thorough cleanup with careful timing
            setTimeout(() => {
              // Run the provided cleanup function
              cleanupFn();
              
              // Additional targeted cleanup for removeChild errors
              try {
                // Clean up any overlay elements still in the DOM
                document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
                  .forEach(element => {
                    try {
                      if (element.parentNode) {
                        // Double-check the element is actually a child
                        const isChild = Array.from(element.parentNode.childNodes).includes(element);
                        if (isChild) {
                          element.parentNode.removeChild(element);
                        }
                      }
                    } catch (e) {
                      // Ignore errors during emergency cleanup
                    }
                  });
              } catch (e) {
                console.warn('Error during emergency cleanup:', e);
              }
              
              // Reset the cleanup flag after a delay
              setTimeout(() => {
                cleanupAttemptedRef.current = false;
              }, 2000);
            }, 0);
          } catch (e) {
            console.warn('Error during error cleanup:', e);
          }
        } else {
          // For other DOM errors, just run the regular cleanup
          cleanupFn();
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
        
        // Use the same error handler logic
        handleError({ message: errorMessage } as ErrorEvent);
      }
    };
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [handleError]);
};
