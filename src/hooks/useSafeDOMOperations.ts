
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
  
  // Safe element removal with enhanced parent checks
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
      if (!Array.from(element.parentNode.childNodes).includes(element)) {
        return false;
      }
      
      // Try the safest removal method first
      try {
        element.remove();
        return true;
      } catch (e) {
        // Fallback to registry method with additional checks
        return domRegistry.safeRemoveElement(element);
      }
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
    domRegistry.cleanupOverlays();
  }, []);
  
  // Check if document is in a usable state
  const isDOMReady = useCallback(() => {
    return domRegistry.isDOMReady();
  }, []);
  
  // Create a DOM cleanup function that runs on component unmount
  const createCleanupFn = useCallback((selector: string) => {
    return () => {
      if (unmountedRef.current) return;
      
      // Safely remove elements matching selector
      if (typeof document !== 'undefined') {
        const elementsToRemove = document.querySelectorAll(selector);
        elementsToRemove.forEach(element => {
          safeRemoveElement(element as Element);
        });
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
