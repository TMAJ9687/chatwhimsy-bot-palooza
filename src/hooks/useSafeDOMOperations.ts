import { useEffect, useCallback, useRef } from 'react';
import { domRegistry } from '@/services/dom';
import { isChildNode } from '@/types/dom';

/**
 * Hook for safely manipulating DOM elements
 */
export const useSafeDOMOperations = () => {
  const operationsInProgressRef = useRef<Set<string>>(new Set());
  const domReadyRef = useRef(typeof document !== 'undefined' && 
                           !!document?.body && 
                           !!document?.documentElement);
  
  // Set DOM ready state on mount
  useEffect(() => {
    domReadyRef.current = typeof document !== 'undefined' && 
                         !!document?.body && 
                         !!document?.documentElement;
    
    // Clean up registry on unmount
    return () => {
      Array.from(operationsInProgressRef.current).forEach(id => {
        if (typeof domRegistry.unregisterOperation === 'function') {
          domRegistry.unregisterOperation(id);
        }
      });
      operationsInProgressRef.current.clear();
    };
  }, []);
  
  /**
   * Safely removes an element from the DOM
   */
  const safeRemoveElement = useCallback((element: Element | null): boolean => {
    if (!element || !element.parentNode) return false;
    
    try {
      // First verify the element is actually in the DOM
      if (!document.body.contains(element)) return false;
      
      // First try the standard remove method
      if (typeof element.remove === 'function') {
        element.remove();
        return true;
      }
      
      // Fallback to removeChild with extra safety checks
      const parent = element.parentNode;
      
      // Verify element is actually a child of the parent
      if (parent && parent.contains(element)) {
        // Check if it's truly a child - extra validation
        const childNodes = Array.from(parent.childNodes);
        if (childNodes.includes(element as Node)) {
          // We need to ensure the node is a ChildNode before removing
          if (isChildNode(element)) {
            parent.removeChild(element);
            return true;
          }
        }
      }
    } catch (e) {
      console.warn('Error removing element:', e);
      
      // Try one more approach with modern APIs
      try {
        if (element && element.parentNode) {
          if (element.parentNode.contains(element)) {
            try {
              element.remove();
              return true;
            } catch (e2) {
              console.warn('Second attempt to remove element failed:', e2);
            }
          }
        }
        
        // Final attempt with removeChild after rechecking parent
        if (element.parentNode && element.parentNode.contains(element) && isChildNode(element)) {
          const parent = element.parentNode;
          // Additional safety check to ensure it's a valid child
          if (element.parentNode === parent) {
            parent.removeChild(element);
            return true;
          }
        }
      } catch (finalError) {
        console.warn('All attempts to remove element failed:', finalError);
        return false;
      }
    }
    
    return false;
  }, []);
  
  /**
   * Safely determines if an element is in the DOM
   */
  const isElementInDOM = useCallback((element: Element | null): boolean => {
    return !!(element && document.body && document.body.contains(element));
  }, []);

  /**
   * Safely removes elements by selector
   */
  const safeRemoveElementsBySelector = useCallback((selector: string): number => {
    try {
      const elements = document.querySelectorAll(selector);
      let removedCount = 0;
      
      elements.forEach(element => {
        if (safeRemoveElement(element)) {
          removedCount++;
        }
      });
      
      return removedCount;
    } catch (e) {
      console.warn(`Error removing elements with selector ${selector}:`, e);
      return 0;
    }
  }, [safeRemoveElement]);

  /**
   * Cleanup overlay elements using domRegistry
   */
  const cleanupOverlays = useCallback((): void => {
    if (!domReadyRef.current) return;
    
    if (domRegistry && typeof domRegistry.cleanupOverlays === 'function') {
      domRegistry.cleanupOverlays();
    } else {
      // Fallback if registry not available
      safeRemoveElementsBySelector('.fixed.inset-0, [role="dialog"], [aria-modal="true"]');
    }
  }, [safeRemoveElementsBySelector]);

  /**
   * Register a node with the DOM registry
   */
  const registerNode = useCallback((node: Node | null): void => {
    if (domRegistry && typeof domRegistry.registerNode === 'function' && node) {
      domRegistry.registerNode(node);
    }
  }, []);

  /**
   * Creates a cleanup function for specific selectors
   */
  const createCleanupFn = useCallback((selectors: string): (() => void) => {
    return () => {
      if (domReadyRef.current) {
        safeRemoveElementsBySelector(selectors);
      }
    };
  }, [safeRemoveElementsBySelector]);

  return {
    safeRemoveElement,
    isElementInDOM,
    safeRemoveElementsBySelector,
    isDOMReady: domReadyRef.current, // Return as boolean value, not function
    cleanupOverlays,
    registerNode,
    createCleanupFn
  };
};
