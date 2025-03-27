
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
  const mutationObserverRef = useRef<MutationObserver | null>(null);
  const nodeRegistryRef = useRef(new WeakMap<Node, boolean>());
  
  // Clear all timeouts when component unmounts
  useEffect(() => {
    // Set up mutation observer to detect and fix orphaned overlays
    try {
      const observer = new MutationObserver((mutations) => {
        // Check for removed nodes that might cause issues
        mutations.forEach(mutation => {
          if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
            // If we detect overlay removal during a navigation, ensure body scroll is restored
            if (document.body) {
              document.body.style.overflow = 'auto';
              document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
            }
          }
        });
      });
      
      // Observe the document body
      if (document.body) {
        observer.observe(document.body, { 
          childList: true, 
          subtree: true 
        });
      }
      
      mutationObserverRef.current = observer;
    } catch (error) {
      console.warn('Error setting up MutationObserver:', error);
    }
    
    return () => {
      // Clean up timeouts
      timeoutsRef.current.forEach(id => window.clearTimeout(id));
      timeoutsRef.current = [];
      
      // Disconnect mutation observer
      if (mutationObserverRef.current) {
        mutationObserverRef.current.disconnect();
        mutationObserverRef.current = null;
      }
      
      // Final cleanup of any pending operations
      if (pendingOperationsRef.current.length > 0) {
        try {
          pendingOperationsRef.current.forEach(operation => {
            try {
              operation();
            } catch (err) {
              console.warn('Error in pending operation cleanup:', err);
            }
          });
          pendingOperationsRef.current = [];
        } catch (error) {
          console.warn('Error in final cleanup:', error);
        }
      }
      
      // Clear node registry
      nodeRegistryRef.current = new WeakMap<Node, boolean>();
    };
  }, []);
  
  // Register a node to track its lifecycle
  const registerNode = useCallback((node: Node | null) => {
    if (!node) return;
    nodeRegistryRef.current.set(node, true);
  }, []);
  
  // Check if a node is registered and still valid
  const isNodeValid = useCallback((node: Node | null) => {
    if (!node) return false;
    return nodeRegistryRef.current.has(node);
  }, []);
  
  // Safe element removal with enhanced parent checks
  const safeRemoveElement = useCallback((element: Element | null) => {
    if (!element) return false;
    
    try {
      // Always unregister the element first
      nodeRegistryRef.current.delete(element);
      
      // Only try to remove if element exists and has a parent
      if (element.parentNode) {
        // Extra validation - we need to be sure the element is ACTUALLY a child of its parent
        const isRealChild = Array.from(element.parentNode.childNodes).includes(element);
        
        if (isRealChild) {
          element.parentNode.removeChild(element);
          return true;
        } else {
          console.warn('Element is not a real child of its parent node');
        }
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
  
  // Process pending operations with improved safety checks
  const processPendingOperations = useCallback(() => {
    // Don't run if already processing or no operations
    if (operationInProgressRef.current || pendingOperationsRef.current.length === 0) {
      return;
    }
    
    const now = Date.now();
    // Throttle operations for stability
    if (now - lastOperationTimeRef.current < 50) {
      const timeoutId = window.setTimeout(processPendingOperations, 50);
      timeoutsRef.current.push(timeoutId);
      return;
    }
    
    operationInProgressRef.current = true;
    lastOperationTimeRef.current = now;
    
    // Use queueMicrotask for better timing than requestAnimationFrame
    queueMicrotask(() => {
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
  
  // Clean all overlay elements with improved safety checks
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
      
      // Store overlay elements to be removed
      const overlaysToRemove: Element[] = [];
      
      // First collect all elements to remove
      selectors.forEach(selector => {
        try {
          document.querySelectorAll(selector).forEach(overlay => {
            if (overlay.parentNode) {
              overlaysToRemove.push(overlay);
            }
          });
        } catch (e) {
          console.warn(`Error finding selector ${selector}:`, e);
        }
      });
      
      // Then remove them one by one with a small delay between operations
      if (overlaysToRemove.length > 0) {
        let index = 0;
        
        const removeNext = () => {
          if (index < overlaysToRemove.length) {
            const overlay = overlaysToRemove[index];
            safeRemoveElement(overlay);
            index++;
            
            // Use a small timeout between removals for stability
            const timeoutId = window.setTimeout(removeNext, 16); // approximately 1 frame at 60fps
            timeoutsRef.current.push(timeoutId);
          }
        };
        
        removeNext();
      }
    };
    
    queueOperation(cleanupOperation);
  }, [queueOperation, safeRemoveElement]);
  
  // Check if document is in a usable state
  const isDOMReady = useCallback(() => {
    return !!(document && document.body && document.documentElement);
  }, []);
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    queueOperation,
    registerNode,
    isNodeValid,
    isDOMReady
  };
};
