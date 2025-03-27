
import { useEffect, useCallback, useRef } from 'react';
import { domRegistry } from '@/services/DOMRegistry';

/**
 * A hook that provides safe DOM operations with additional checks and protections
 * against the "Failed to execute 'removeChild' on 'Node'" error
 */
export const useSafeDOMOperations = () => {
  const unmountedRef = useRef(false);
  const operationsTimeoutsRef = useRef<number[]>([]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      
      // Clear any pending timeouts
      operationsTimeoutsRef.current.forEach(timeoutId => {
        window.clearTimeout(timeoutId);
      });
      operationsTimeoutsRef.current = [];
    };
  }, []);

  // Register a node to track its lifecycle
  const registerNode = useCallback((node: Node | null) => {
    if (unmountedRef.current || !node) return;
    
    // Use RAF to ensure we're not in the middle of a render cycle
    requestAnimationFrame(() => {
      if (!unmountedRef.current) {
        domRegistry.registerNode(node);
      }
    });
  }, []);
  
  // Check if a node is registered and still valid
  const isNodeValid = useCallback((node: Node | null) => {
    if (unmountedRef.current || !node) return false;
    return domRegistry.isNodeValid(node);
  }, []);
  
  // Safe element removal with enhanced error handling
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (unmountedRef.current || !element) return false;
    
    try {
      return domRegistry.safeRemoveElement(element);
    } catch (error) {
      console.warn('Error in safeRemoveElement:', error);
      return false;
    }
  }, []);
  
  // Queue an operation with better timing control
  const queueOperation = useCallback((operation: () => void, delay = 0) => {
    if (unmountedRef.current) return;
    
    if (delay > 0) {
      const timeoutId = window.setTimeout(() => {
        if (!unmountedRef.current) {
          domRegistry.queueOperation(operation);
        }
      }, delay);
      
      operationsTimeoutsRef.current.push(timeoutId);
    } else {
      domRegistry.queueOperation(operation);
    }
  }, []);
  
  // Cleanup overlays with improved timing
  const cleanupOverlays = useCallback(() => {
    if (unmountedRef.current) return;
    
    // Use requestAnimationFrame for more reliable timing
    requestAnimationFrame(() => {
      if (!unmountedRef.current) {
        domRegistry.cleanupOverlays();
      }
    });
  }, []);
  
  // Check if document is ready for DOM operations
  const isDOMReady = useCallback(() => {
    return domRegistry.isDOMReady();
  }, []);
  
  // Enhanced body scroll management
  const resetBodyScroll = useCallback(() => {
    if (unmountedRef.current || !isDOMReady()) return;
    
    try {
      if (document.body) {
        document.body.style.overflow = 'auto';
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      }
    } catch (error) {
      console.warn('Error resetting body scroll:', error);
    }
  }, [isDOMReady]);
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    queueOperation,
    registerNode,
    isNodeValid,
    isDOMReady,
    resetBodyScroll
  };
};
