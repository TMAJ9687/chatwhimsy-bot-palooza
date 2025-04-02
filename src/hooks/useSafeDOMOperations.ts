
import { useCallback, useRef } from 'react';

/**
 * Hook that provides safe DOM manipulation utilities
 */
export const useSafeDOMOperations = () => {
  // Keep track of DOM nodes we've created for safe cleanup
  const nodesRegistryRef = useRef(new WeakMap());
  
  /**
   * Register a DOM node for future tracking/cleanup
   */
  const registerNode = useCallback((node: Element) => {
    nodesRegistryRef.current.set(node, true);
  }, []);
  
  /**
   * Safely remove a DOM element with validation
   */
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (!element) return false;
    
    try {
      // First validate element still exists and has a parent
      if (!element.parentNode) return false;
      
      // Check if element is in DOM
      if (!document.contains(element)) return false;
      
      // Verify parent-child relationship
      const isRealChild = Array.from(element.parentNode.childNodes).includes(element);
      if (!isRealChild) return false;
      
      // Try removing with element.remove()
      try {
        element.remove();
        return true;
      } catch (e) {
        // Fallback to parentNode.removeChild
        if (element.parentNode && element.parentNode.contains(element)) {
          element.parentNode.removeChild(element);
          return true;
        }
      }
    } catch (error) {
      console.warn('Error removing element safely:', error);
    }
    
    return false;
  }, []);
  
  /**
   * Clean up all overlays in the document
   */
  const cleanupOverlays = useCallback(() => {
    try {
      // Reset body state
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
      }
      
      // Common overlay selectors
      const selectors = [
        '.fixed.inset-0',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        '.backdrop',
        '.modal-backdrop'
      ];
      
      // Try to safely remove each overlay
      selectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
          safeRemoveElement(element);
        });
      });
    } catch (error) {
      console.warn('Error cleaning up overlays:', error);
    }
  }, [safeRemoveElement]);
  
  /**
   * Check if DOM is ready for operations
   */
  const isDOMReady = useCallback(() => {
    return typeof document !== 'undefined' && 
           !!document?.body && 
           !!document?.documentElement;
  }, []);
  
  /**
   * Create a cleanup function for specific selectors
   */
  const createCleanupFn = useCallback((selectors: string) => {
    return () => {
      if (!isDOMReady()) return;
      
      try {
        // Reset body state
        if (document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        }
        
        // Try to safely remove elements matching the selectors
        document.querySelectorAll(selectors).forEach(element => {
          safeRemoveElement(element);
        });
      } catch (error) {
        console.warn(`Error in cleanup function for ${selectors}:`, error);
      }
    };
  }, [safeRemoveElement, isDOMReady]);
  
  return {
    registerNode,
    safeRemoveElement,
    cleanupOverlays,
    isDOMReady,
    createCleanupFn
  };
};

export default useSafeDOMOperations;
