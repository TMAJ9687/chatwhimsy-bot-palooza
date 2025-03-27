
import { useCallback, useEffect, useRef } from 'react';

/**
 * A hook that provides safe DOM operations with additional checks and protections
 * against the "Failed to execute 'removeChild' on 'Node'" error
 */
export const useSafeDOMOperations = () => {
  const operationInProgressRef = useRef(false);
  const lastOperationTimeRef = useRef(0);
  const pendingOperationsRef = useRef<Array<() => void>>([]);
  const timeoutsRef = useRef<number[]>([]);
  
  // Clear all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);
  
  // Safe element removal with parent checks
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (!element) return false;
    
    try {
      if (element.parentNode && element.parentNode.contains(element)) {
        element.parentNode.removeChild(element);
        return true;
      }
    } catch (e) {
      console.warn('Safe element removal failed:', e);
    }
    
    return false;
  }, []);
  
  // Queue an operation to be executed when safe
  const queueOperation = useCallback((operation: () => void) => {
    pendingOperationsRef.current.push(operation);
    
    // Process the queue if no operation is in progress
    if (!operationInProgressRef.current) {
      processPendingOperations();
    }
  }, []);
  
  // Process pending operations with safety checks
  const processPendingOperations = useCallback(() => {
    // Don't run if already processing or no operations
    if (operationInProgressRef.current || pendingOperationsRef.current.length === 0) {
      return;
    }
    
    const now = Date.now();
    // Don't run operations too frequently
    if (now - lastOperationTimeRef.current < 50) {
      const timeoutId = window.setTimeout(processPendingOperations, 50);
      timeoutsRef.current.push(timeoutId);
      return;
    }
    
    operationInProgressRef.current = true;
    lastOperationTimeRef.current = now;
    
    // Use requestAnimationFrame for DOM operations
    requestAnimationFrame(() => {
      try {
        // Execute the next operation
        const nextOperation = pendingOperationsRef.current.shift();
        if (nextOperation) {
          nextOperation();
        }
      } catch (error) {
        console.warn('Error during DOM operation:', error);
      } finally {
        operationInProgressRef.current = false;
        
        // Process next operation after a small delay
        const timeoutId = window.setTimeout(() => {
          if (pendingOperationsRef.current.length > 0) {
            processPendingOperations();
          }
        }, 10);
        
        timeoutsRef.current.push(timeoutId);
      }
    });
  }, []);
  
  // Clean all overlay elements safely
  const cleanupOverlays = useCallback(() => {
    if (operationInProgressRef.current) {
      // Queue if another operation is in progress
      queueOperation(cleanupOverlays);
      return;
    }
    
    const cleanupOperation = () => {
      if (!document || !document.body) return;
      
      // Reset body scroll
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      // Look for all possible overlay types
      const selectors = [
        // Modal/dialog overlays
        '.fixed.inset-0.z-50',
        '.fixed.inset-0.bg-black\\/80',
        // Radix UI specific overlays
        '[data-radix-dialog-overlay]',
        '[data-radix-alert-dialog-overlay]',
        // Vaul drawer overlays
        '.vaul-overlay',
        // Any other potential overlays
        '.backdrop',
        '.modal-backdrop'
      ];
      
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(overlay => {
            safeRemoveElement(overlay);
          });
        } catch (e) {
          console.warn(`Error cleaning up selector ${selector}:`, e);
        }
      });
    };
    
    queueOperation(cleanupOperation);
  }, [queueOperation, safeRemoveElement]);
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    queueOperation
  };
};
