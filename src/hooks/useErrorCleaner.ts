
import { useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  // Track cleanup attempts to prevent loops
  const cleanupAttemptedRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  
  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Create a memoized error handler
  const handleError = useCallback((error: ErrorEvent) => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;
    
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
        // Skip if component unmounted
        if (!isMountedRef.current) return;
        
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
              // Skip if component unmounted
              if (!isMountedRef.current) return;
              
              // Run the provided cleanup function
              cleanupFn();
              
              // Additional targeted cleanup for removeChild errors
              try {
                // Skip if component unmounted
                if (!isMountedRef.current) return;
                
                // Clean up any overlay elements still in the DOM
                document.querySelectorAll('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]')
                  .forEach(element => {
                    try {
                      if (element.parentNode && document.contains(element)) {
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
                if (isMountedRef.current) {
                  cleanupAttemptedRef.current = false;
                }
              }, 2000);
            }, 0);
          } catch (e) {
            console.warn('Error during error cleanup:', e);
          }
        } else {
          // For other DOM errors, just run the regular cleanup if component is mounted
          if (isMountedRef.current) {
            cleanupFn();
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
      // Skip if component unmounted
      if (!isMountedRef.current) return;
      
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
      // Set mounted flag to false first
      isMountedRef.current = false;
      
      // Then remove event listeners
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [handleError]);
};
