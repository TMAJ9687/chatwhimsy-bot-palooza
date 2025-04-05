
import { useCallback, useEffect, useRef } from 'react';
import { domRegistry } from '@/services/dom/DOMRegistry';

/**
 * Hook that provides safe DOM manipulation utilities
 */
export const useSafeDOMOperations = () => {
  const registryRef = useRef(domRegistry);
  
  // Ensure cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        registryRef.current.cleanup();
      } catch (error) {
        console.warn('Error during DOM operations cleanup:', error);
      }
    };
  }, []);
  
  /**
   * Check if DOM is ready for operations
   */
  const isDOMReady = useCallback(() => {
    return registryRef.current.isDOMReady();
  }, []);
  
  /**
   * Register a DOM node for tracking
   */
  const registerNode = useCallback((node: Node | null) => {
    registryRef.current.registerNode(node);
  }, []);
  
  /**
   * Check if a node is still valid in the document
   */
  const isNodeValid = useCallback((node: Node | null): boolean => {
    return registryRef.current.isNodeValid(node);
  }, []);
  
  /**
   * Safely remove an element with validation
   */
  const safeRemoveElement = useCallback((element: Element | null) => {
    return registryRef.current.safeRemoveElement(element);
  }, []);
  
  /**
   * Clean up all overlays in the document with a safer approach
   */
  const cleanupOverlays = useCallback(() => {
    registryRef.current.cleanupOverlays();
  }, []);
  
  return {
    isDOMReady,
    isNodeValid,
    cleanupOverlays,
    registerNode,
    safeRemoveElement
  };
};

export default useSafeDOMOperations;
