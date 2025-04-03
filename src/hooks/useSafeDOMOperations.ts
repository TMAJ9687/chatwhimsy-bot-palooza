
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
           document?.readyState !== 'loading' &&
           !!document?.body && 
           !!document?.documentElement;
  }, []);
  
  /**
   * Register a DOM node for tracking
   */
  const registerNode = useCallback((node: Node | null) => {
    if (!node) return;
    
    try {
      // Add a data attribute to mark this node as registered
      if (node instanceof Element) {
        node.setAttribute('data-registered', Date.now().toString());
      }
    } catch (error) {
      console.warn('Error registering node:', error);
    }
  }, []);
  
  /**
   * Check if a node is still valid in the document
   */
  const isNodeValid = useCallback((node: Node | null): boolean => {
    if (!node || !isDOMReady()) return false;
    
    try {
      // Check if the node is still part of the document
      return document.contains(node) && !!node.parentNode;
    } catch (error) {
      console.warn('Error checking node validity:', error);
      return false;
    }
  }, [isDOMReady]);
  
  /**
   * Safely remove an element with validation
   */
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (!element || !isDOMReady()) return false;
    
    try {
      // Basic validations before attempting removal
      if (!element.parentNode) {
        return false;
      }
      
      // Check that the element is actually in the DOM
      if (!document.contains(element)) {
        return false;
      }
      
      // Use a safer approach for element removal
      const parent = element.parentNode;
      
      // Use a try-catch for the actual removal with multiple safeguards
      try {
        // First try the modern Element.remove() method
        element.remove();
        return true;
      } catch (e) {
        // If remove() fails, try removeChild() as fallback
        try {
          if (parent && document.contains(parent)) {
            parent.removeChild(element);
            return true;
          }
        } catch (innerError) {
          console.warn('Failed to remove element using both methods:', innerError);
        }
      }
    } catch (error) {
      console.warn('Error removing element:', error);
    }
    
    return false;
  }, [isDOMReady]);
  
  /**
   * Clean up all overlays in the document with a safer approach
   */
  const cleanupOverlays = useCallback(() => {
    if (!isDOMReady()) return;
    
    try {
      // Use a data attribute approach for safer DOM manipulation
      if (document.body) {
        // Signal components to clean up by setting a data attribute
        document.body.setAttribute('data-cleanup-overlays', Date.now().toString());
        
        // Reset body state using classList for better browser compatibility
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        
        // Reset overflow style directly
        document.body.style.overflow = '';
        
        // Remove modal backdrops using a safer approach
        try {
          const backdrops = document.querySelectorAll('.fixed.inset-0[role="dialog"],.fixed.inset-0[aria-modal="true"]');
          backdrops.forEach(backdrop => {
            if (backdrop && backdrop.parentNode && document.contains(backdrop)) {
              safeRemoveElement(backdrop as Element);
            }
          });
        } catch (error) {
          console.warn('Error removing modal backdrops:', error);
        }
        
        // Clean up attribute after a delay to ensure components have time to react
        setTimeout(() => {
          if (document.body) {
            document.body.removeAttribute('data-cleanup-overlays');
          }
        }, 300);
      }
    } catch (error) {
      console.warn('Error cleaning up overlays:', error);
    }
  }, [isDOMReady, safeRemoveElement]);
  
  return {
    isDOMReady,
    isNodeValid,
    cleanupOverlays,
    registerNode,
    safeRemoveElement
  };
};

export default useSafeDOMOperations;
