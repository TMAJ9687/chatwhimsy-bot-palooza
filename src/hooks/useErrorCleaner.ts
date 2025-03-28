
import { useEffect, useCallback, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { DOMSafetyUtils } from "@/services/dom/DOMSafetyUtils";

/**
 * Hook to listen for DOM errors and trigger cleanup
 */
export const useErrorCleaner = (cleanupFn: () => void) => {
  // Track cleanup attempts to prevent loops
  const cleanupAttemptedRef = useRef(false);
  const lastCleanupTimeRef = useRef(0);
  const isMountedRef = useRef(true);
  const safetyUtils = useRef(new DOMSafetyUtils());
  
  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Enhanced DOM emergency cleanup
  const performEmergencyCleanup = useCallback(() => {
    // Skip if component is unmounted
    if (!isMountedRef.current) return;
    
    console.log('[useErrorCleaner] Performing emergency DOM cleanup');
    
    // Reset body state
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Get all overlay elements
    const selectors = [
      '.fixed.inset-0', 
      '[data-radix-dialog-overlay]', 
      '[data-radix-alert-dialog-overlay]'
    ];
    
    // Process overlay elements with enhanced validation
    selectors.forEach(selector => {
      try {
        safetyUtils.current.safeRemoveElementsBySelector(selector);
      } catch (e) {
        console.warn(`[useErrorCleaner] Error in emergency cleanup of ${selector}:`, e);
      }
    });
    
    // Also run the provided cleanup function
    cleanupFn();
  }, [cleanupFn]);
  
  // Create a memoized error handler
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
    
    // Enhanced check for removeChild errors
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('parentNode') || 
      errorMessage.includes('Cannot read properties of null') ||
      errorMessage.includes('not a child of this node') ||
      errorMessage.includes('Failed to execute') && errorMessage.includes('on') && errorMessage.includes('Node')
    ) {
      console.warn('DOM error detected, running cleanup:', errorMessage);
      
      // Mark that we've attempted cleanup
      cleanupAttemptedRef.current = true;
      lastCleanupTimeRef.current = now;
      
      // Prevent default error behavior to avoid cascading errors
      error.preventDefault();
      
      // Use more reliable microtask scheduling
      queueMicrotask(() => {
        if (!isMountedRef.current) return;
        performEmergencyCleanup();
      });
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
        errorMessage.includes('not a child')
      ) {
        console.warn('Promise rejection with DOM error detected:', errorMessage);
        event.preventDefault();
        handleError({ message: errorMessage } as ErrorEvent);
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
    emergencyCleanup: performEmergencyCleanup
  };
};
