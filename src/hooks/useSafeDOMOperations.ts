
import { useCallback } from 'react';

/**
 * Hook that provides safe DOM manipulation utilities
 */
export const useSafeDOMOperations = () => {
  /**
   * Check if DOM is ready for operations
   */
  const isDOMReady = useCallback(() => {
    return typeof document !== 'undefined' && 
           !!document?.body && 
           !!document?.documentElement;
  }, []);
  
  /**
   * Clean up all overlays in the document by dispatching a cleanup event
   * This pattern avoids direct DOM manipulation
   */
  const cleanupOverlays = useCallback(() => {
    try {
      // Create and dispatch a custom event for overlay cleanup
      if (typeof document !== 'undefined' && document.body) {
        // Signal components to clean up by setting a data attribute
        document.body.setAttribute('data-cleanup-overlays', Date.now().toString());
        
        // Reset body state using classes instead of direct style manipulation
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        
        // Clear the attribute after a short delay
        setTimeout(() => {
          document.body.removeAttribute('data-cleanup-overlays');
        }, 100);
      }
    } catch (error) {
      console.warn('Error cleaning up overlays:', error);
    }
  }, []);
  
  /**
   * Create a cleanup function for specific selectors
   * Uses class-based approach instead of direct DOM removal
   */
  const createCleanupFn = useCallback((selector: string) => {
    return () => {
      if (!isDOMReady()) return;
      
      try {
        // Reset body classes
        if (document.body) {
          document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        }
        
        // Signal cleanup via data attribute
        document.body.setAttribute('data-cleanup-target', selector);
        
        // Clear the attribute after a short delay
        setTimeout(() => {
          document.body.removeAttribute('data-cleanup-target');
        }, 100);
      } catch (error) {
        console.warn(`Error in cleanup function for ${selector}:`, error);
      }
    };
  }, [isDOMReady]);
  
  return {
    isDOMReady,
    cleanupOverlays,
    createCleanupFn
  };
};

export default useSafeDOMOperations;
