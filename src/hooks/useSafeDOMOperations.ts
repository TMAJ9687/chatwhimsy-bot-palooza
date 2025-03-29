
import { useEffect, useCallback, useRef } from 'react';
import { domRegistry } from '@/services/dom';

/**
 * A hook that provides safe DOM operations with additional checks and protections
 * against common DOM manipulation errors
 */
export const useSafeDOMOperations = () => {
  const unmountedRef = useRef(false);
  const pendingOperationsRef = useRef<Array<() => void>>([]);
  
  // Clean up on unmount
  useEffect(() => {
    unmountedRef.current = false;
    
    return () => {
      unmountedRef.current = true;
      
      // Execute any pending cleanup operations during unmount
      pendingOperationsRef.current.forEach(operation => {
        try {
          operation();
        } catch (err) {
          console.warn('Error executing pending operation during unmount:', err);
        }
      });
      pendingOperationsRef.current = [];
    };
  }, []);

  // Register a node to track its lifecycle
  const registerNode = useCallback((node: Node | null) => {
    if (unmountedRef.current || !node) return;
    domRegistry.registerNode(node);
  }, []);
  
  // Check if a node is registered and still valid
  const isNodeValid = useCallback((node: Node | null) => {
    if (unmountedRef.current || !node) return false;
    return domRegistry.isNodeValid(node);
  }, []);
  
  // Safe element removal with enhanced parent checks and retry mechanism
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (unmountedRef.current || !element) return false;
    
    try {
      // First check if the element is still in the DOM
      if (!document.contains(element)) {
        return false;
      }
      
      // Check if it has a parent
      if (!element.parentNode) {
        return false;
      }
      
      // Verify it's a child of its parent
      const parentChildNodes = Array.from(element.parentNode.childNodes);
      if (!parentChildNodes.includes(element as Node)) {
        return false;
      }
      
      // Try the safest removal method first
      try {
        element.remove();
        return true;
      } catch (e) {
        console.warn('element.remove() failed, falling back to safer method:', e);
        
        // Recheck element state after failure
        if (!element.parentNode || !document.contains(element)) {
          return false;
        }
        
        // Verify again it's a child of its parent (could have changed)
        const updatedParentChildNodes = Array.from(element.parentNode.childNodes);
        if (!updatedParentChildNodes.includes(element as Node)) {
          return false;
        }
        
        // Final attempt with removeChild after rechecking parent
        if (element.parentNode.contains(element)) {
          const parent = element.parentNode;
          // Safer way to handle DOM element removal
          parent.removeChild(element);
          return true;
        }
      }
      return false;
    } catch (e) {
      console.warn('Error in safeRemoveElement:', e);
      return false;
    }
  }, []);
  
  // Queue an operation to be executed when safe
  const queueOperation = useCallback((operation: () => void) => {
    if (unmountedRef.current) return;
    
    // Add to pending operations for cleanup if component unmounts
    pendingOperationsRef.current.push(operation);
    
    // Execute via registry
    domRegistry.queueOperation(() => {
      // Check again if still mounted before executing
      if (!unmountedRef.current) {
        try {
          operation();
        } finally {
          // Remove from pending operations
          const index = pendingOperationsRef.current.indexOf(operation);
          if (index !== -1) {
            pendingOperationsRef.current.splice(index, 1);
          }
        }
      }
    });
  }, []);
  
  // Clean all overlay elements with improved safety checks
  const cleanupOverlays = useCallback(() => {
    if (unmountedRef.current) return;
    
    if (typeof document !== 'undefined' && document.body) {
      // First reset body state
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      // Then cleanup overlays
      domRegistry.cleanupOverlays();
    }
  }, []);
  
  // Check if document is in a usable state
  const isDOMReady = useCallback(() => {
    return typeof document !== 'undefined' && document.readyState === 'complete';
  }, []);
  
  // Create a DOM cleanup function that runs on component unmount
  const createCleanupFn = useCallback((selector: string) => {
    return () => {
      if (unmountedRef.current) return;
      
      // Safely remove elements matching selector
      if (typeof document !== 'undefined') {
        try {
          const elementsToRemove = document.querySelectorAll(selector);
          
          // Use the safer forEach approach with each element validated individually
          elementsToRemove.forEach(element => {
            if (!unmountedRef.current) {
              safeRemoveElement(element);
            }
          });
        } catch (err) {
          console.warn(`Error during cleanup with selector ${selector}:`, err);
        }
      }
    };
  }, [safeRemoveElement]);
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    queueOperation,
    registerNode,
    isNodeValid,
    isDOMReady,
    createCleanupFn,
    isMounted: !unmountedRef.current
  };
};
