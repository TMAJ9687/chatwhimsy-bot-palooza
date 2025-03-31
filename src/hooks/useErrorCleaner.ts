import { useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { safeRemoveElement, resetBodyState } from "@/utils/domUtils";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  // Track cleanup attempts to prevent loops
  const cleanupAttemptedRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const errorCountRef = useRef(0);
  
  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    errorCountRef.current = 0;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Enhanced DOM emergency cleanup with progressive strategies
  const performEmergencyCleanup = useCallback(() => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;
    
    console.log('[useErrorCleaner] Performing emergency DOM cleanup');
    
    // Reset body state
    resetBodyState();
    
    // Get all overlay elements - expanded list of selectors
    const selectors = [
      '.fixed.inset-0', 
      '[data-radix-dialog-overlay]', 
      '[data-radix-alert-dialog-overlay]',
      '.vaul-overlay',
      '.backdrop',
      '.modal-backdrop',
      '.fixed.z-50',
      '[aria-modal="true"]',
      '[role="dialog"]'
    ];
    
    // Process overlay elements with enhanced validation and incremental cleanup
    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          safeRemoveElement(el);
        });
      } catch (e) {
        console.warn(`[useErrorCleaner] Error in emergency cleanup of ${selector}:`, e);
      }
    });
    
    // Also run the provided cleanup function
    try {
      cleanupFn();
    } catch (e) {
      console.warn('[useErrorCleaner] Error running cleanup function:', e);
    }
    
    // If we've had multiple errors, take more drastic measures
    if (errorCountRef.current > 2) {
      try {
        // Force React to refresh its internal state for DOM operations
        // This is a last resort measure
        if (document.body) {
          const temporaryDiv = document.createElement('div');
          document.body.appendChild(temporaryDiv);
          requestAnimationFrame(() => {
            try {
              if (document.body.contains(temporaryDiv)) {
                safeRemoveElement(temporaryDiv);
              }
            } catch (e) {
              // Ignore temporary div cleanup errors
            }
          });
        }
      } catch (e) {
        console.warn('[useErrorCleaner] Error in aggressive cleanup:', e);
      }
    }
  }, [cleanupFn]);
  
  // Create a memoized error handler with improved detection
  const handleError = useCallback((error: ErrorEvent) => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;
    
    const errorMessage = error.message || '';
    const now = Date.now();
    
    // Only attempt cleanup if we haven't recently done so (with increased timeout)
    if (cleanupAttemptedRef.current && (now - lastCleanupTimeRef.current < 2000)) {
      console.log('Skipping redundant cleanup, already attempted recently');
      return;
    }
    
    // Enhanced check for DOM errors
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('parentNode') || 
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('not a child of this node') ||
      (errorMessage.includes('Failed to execute') && errorMessage.includes('on') && errorMessage.includes('Node')) ||
      errorMessage.includes('The node to be removed is not a child of this node')
    ) {
      console.warn('DOM error detected, running cleanup:', errorMessage);
      
      // Mark that we've attempted cleanup
      cleanupAttemptedRef.current = true;
      lastCleanupTimeRef.current = now;
      errorCountRef.current += 1;
      
      // Prevent default error behavior to avoid cascading errors
      error.preventDefault();
      error.stopPropagation();
      
      // Use more reliable microtask scheduling
      queueMicrotask(() => {
        if (!isMountedRef.current) return;
        performEmergencyCleanup();
        
        // Reset the cleanup attempt flag after a delay
        setTimeout(() => {
          if (isMountedRef.current) {
            cleanupAttemptedRef.current = false;
          }
        }, 2500);
      });
      
      return false;
    }
  }, [performEmergencyCleanup]);
  
  useEffect(() => {
    // Add error handler with capture phase to catch errors early
    window.addEventListener('error', handleError, { capture: true });
    
    // Add unhandled rejection handler for promises
    const handleRejection = (event: PromiseRejectionEvent) => {
      // Skip if component unmounted
      if (!isMountedRef.current) return;
      
      const errorMessage = event.reason?.message || String(event.reason);
      if (
        errorMessage.includes('removeChild') || 
        errorMessage.includes('parentNode') || 
        errorMessage.includes('not a child') ||
        errorMessage.includes('The node to be removed')
      ) {
        console.warn('Promise rejection with DOM error detected:', errorMessage);
        event.preventDefault();
        handleError({ 
          message: errorMessage, 
          preventDefault: () => {}, 
          stopPropagation: () => {} 
        } as unknown as ErrorEvent);
      }
    };
    window.addEventListener('unhandledrejection', handleRejection, { capture: true });
    
    // Immediately clean up any existing problematic elements
    queueMicrotask(() => {
      if (isMountedRef.current) {
        performEmergencyCleanup();
      }
    });
    
    return () => {
      // Set mounted flag to false first
      isMountedRef.current = false;
      
      // Then remove event listeners
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleRejection, { capture: true });
    };
  }, [handleError, performEmergencyCleanup]);
  
  // Return the emergency cleanup function for manual triggering
  return {
    emergencyCleanup: performEmergencyCleanup,
    errorCount: errorCountRef.current
  };
};
