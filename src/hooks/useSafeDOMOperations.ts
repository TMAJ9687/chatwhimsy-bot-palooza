
import { useEffect, useCallback, useRef } from 'react';
import { domRegistry } from '@/services/dom';

/**
 * A hook that provides safe DOM operations with additional checks and protections
 * against common DOM manipulation errors
 */
export const useSafeDOMOperations = () => {
  const unmountedRef = useRef(false);
  
  // Clean up on unmount
  useEffect(() => {
    unmountedRef.current = false;
    
    return () => {
      unmountedRef.current = true;
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
      // Use the safer .remove() method if available
      if (element && typeof element.remove === 'function') {
        element.remove();
        return true;
      }
      
      // Fallback to domRegistry method
      return domRegistry.safeRemoveElement(element);
    } catch (e) {
      console.warn('Error in safeRemoveElement:', e);
      return false;
    }
  }, []);
  
  // Queue an operation to be executed when safe
  const queueOperation = useCallback((operation: () => void) => {
    if (unmountedRef.current) return;
    domRegistry.queueOperation(operation);
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
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    queueOperation,
    registerNode,
    isNodeValid,
    isDOMReady,
    isMounted: !unmountedRef.current
  };
};
