
import { useEffect, useCallback, useRef } from 'react';
import { domRegistry } from '@/services/dom';
import { 
  safeRemoveElement, 
  safeRemoveElementsBySelector, 
  isElementInDOM, 
  resetBodyState 
} from '@/utils/domUtils';

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
  }, []);

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
  }, []);

  return {
    safeRemoveElement,
    isElementInDOM,
    safeRemoveElementsBySelector,
    isDOMReady: domReadyRef.current, // Return as boolean value, not function
    cleanupOverlays,
    registerNode,
    createCleanupFn,
    resetBodyState
  };
};
