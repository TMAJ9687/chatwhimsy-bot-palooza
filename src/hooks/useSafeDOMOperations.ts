/**
 * DEPRECATED: This hook has been replaced with React-based implementations.
 * This file is kept for backward compatibility but should not be used for new code.
 * Use the UIContext, useDialog, and useModal hooks instead.
 */
import { useCallback, useEffect, useRef } from 'react';
import { useUI } from '@/context/UIContext';

/**
 * @deprecated Use UIContext and related hooks instead
 */
export const useSafeDOMOperations = () => {
  // Keep track of DOM nodes we've created for safe cleanup
  const nodesRegistryRef = useRef(new WeakMap());
  const { lockBody, unlockBody } = useUI();
  
  useEffect(() => {
    console.warn(
      'useSafeDOMOperations is deprecated. Use UIContext, useDialog, and useModal hooks instead.'
    );
  }, []);
  
  /**
   * Register a DOM node for future tracking/cleanup
   * @deprecated Use the modal and dialog system
   */
  const registerNode = useCallback((node: Element) => {
    nodesRegistryRef.current.set(node, true);
  }, []);
  
  /**
   * @deprecated Use UIContext for declarative UI management
   */
  const safeRemoveElement = useCallback((element: Element | null) => {
    console.warn('safeRemoveElement is deprecated. Use React refs and effects instead.');
    return false;
  }, []);
  
  /**
   * @deprecated Use UIContext for declarative UI management
   */
  const cleanupOverlays = useCallback(() => {
    console.warn('cleanupOverlays is deprecated. Use useDialog and useModal hooks instead.');
    unlockBody();
  }, [unlockBody]);
  
  /**
   * @deprecated Use React's built-in mechanisms
   */
  const isDOMReady = useCallback(() => {
    return typeof document !== 'undefined' && 
           !!document?.body && 
           !!document?.documentElement;
  }, []);
  
  /**
   * @deprecated Use useEffect cleanup functions
   */
  const createCleanupFn = useCallback((selectors: string) => {
    return () => {
      console.warn('createCleanupFn is deprecated. Use React effects instead.');
      unlockBody();
    };
  }, [unlockBody]);
  
  return {
    registerNode,
    safeRemoveElement,
    cleanupOverlays,
    isDOMReady,
    createCleanupFn
  };
};

export default useSafeDOMOperations;
