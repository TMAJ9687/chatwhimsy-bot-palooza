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
   * Safely remove a DOM element with enhanced validation
   */
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (!element) return false;
    
    try {
      // First validate element still exists and has a parent
      if (!element.parentNode) return false;
      
      // Check if element is in DOM
      if (!document.contains(element)) return false;
      
      // Enhanced check for parent-child relationship using Array.from
      // This is more reliable than nodeList.contains
      const parentChildArray = Array.from(element.parentNode.childNodes);
      if (!parentChildArray.includes(element)) return false;
      
      // Try removing with element.remove() first (modern browsers)
      try {
        element.remove();
        return true;
      } catch (e) {
        console.log('element.remove() failed, trying parentNode.removeChild with extra validation');
        
        // Final validation before removal attempt
        const parent = element.parentNode;
        if (parent && document.contains(element) && Array.from(parent.childNodes).includes(element)) {
          parent.removeChild(element);
          return true;
        }
      }
    } catch (error) {
      console.warn('Error removing element safely:', error);
    }
    
    return false;
  }, []);
  
  /**
   * Clean up all overlays in the document with extra safeguards
   */
  const cleanupOverlays = useCallback(() => {
    try {
      // Reset body state
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
      }
      
      // Common overlay selectors - expanded to cover all possible modal overlays
      const selectors = [
        '.fixed.inset-0',
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        '.backdrop',
        '.modal-backdrop',
        '[role="dialog"]',
        '[aria-modal="true"]',
        '.vaul-overlay'
      ];
      
      // Process each selector individually to prevent cascading failures
      selectors.forEach(selector => {
        try {
          // Wrap in a try-catch to prevent one selector failure from affecting others
          document.querySelectorAll(selector).forEach(element => {
            // Process each element individually
            try {
              safeRemoveElement(element);
            } catch (elementError) {
              console.warn(`Failed to safely remove ${selector} element:`, elementError);
            }
          });
        } catch (selectorError) {
          console.warn(`Error processing selector ${selector}:`, selectorError);
        }
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
