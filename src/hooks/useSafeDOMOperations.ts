
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
    // Simply store a reference to this node
    // This function mainly exists for consistent API interface
    // Actual registration happens in DOMRegistry
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
      
      // Verify the element is actually a child of its parent
      const isChild = Array.from(element.parentNode.childNodes).includes(element);
      if (!isChild) {
        return false;
      }
      
      // Remove safely using the modern Element.remove() method first
      try {
        element.remove();
        return true;
      } catch (e) {
        // Fallback to parent.removeChild() with additional checks
        if (element.parentNode && document.contains(element) && element.parentNode.contains(element)) {
          element.parentNode.removeChild(element);
          return true;
        }
      }
    } catch (error) {
      console.warn('Error removing element:', error);
    }
    
    return false;
  }, [isDOMReady]);
  
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
    createCleanupFn,
    registerNode,
    safeRemoveElement
  };
};

export default useSafeDOMOperations;
