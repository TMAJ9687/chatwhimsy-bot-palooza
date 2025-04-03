
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
      return document.contains(node) && !!node.parentNode;
    } catch (error) {
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
      
      // Verify the element is actually a child of its parent before attempting removal
      const parent = element.parentNode;
      if (!parent || !Array.from(parent.childNodes).includes(element)) {
        return false;
      }
      
      // Use a try-catch for the actual removal
      try {
        element.remove();
        return true;
      } catch (e) {
        // Only try removeChild if we've verified parent-child relationship
        if (parent && document.contains(parent) && Array.from(parent.childNodes).includes(element)) {
          parent.removeChild(element);
          return true;
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
      // Use a data attribute approach instead of direct DOM manipulation
      if (document.body) {
        // Signal components to clean up by setting a data attribute
        document.body.setAttribute('data-cleanup-overlays', Date.now().toString());
        
        // Reset body state using classes instead of direct style manipulation
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
        document.body.style.overflow = '';
        
        // Clean up attribute after a delay
        setTimeout(() => {
          if (document.body) {
            document.body.removeAttribute('data-cleanup-overlays');
          }
        }, 200);
      }
    } catch (error) {
      console.warn('Error cleaning up overlays:', error);
    }
  }, [isDOMReady]);
  
  return {
    isDOMReady,
    isNodeValid,
    cleanupOverlays,
    registerNode,
    safeRemoveElement
  };
};

export default useSafeDOMOperations;
