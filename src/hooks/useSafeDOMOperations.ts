
import React from 'react';

export function useSafeDOMOperations() {
  // A registry of DOM nodes to track
  const registeredNodesRef = React.useRef<Set<HTMLElement>>(new Set());
  
  // Registry cleanup
  React.useEffect(() => {
    return () => {
      registeredNodesRef.current.clear();
    };
  }, []);
  
  // Register a node to track
  const registerNode = React.useCallback((node: HTMLElement) => {
    registeredNodesRef.current.add(node);
  }, []);
  
  // Safely remove a specific element
  const safeRemoveElement = React.useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    try {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
        registeredNodesRef.current.delete(element);
      }
    } catch (error) {
      console.warn('Error removing element:', error);
    }
  }, []);
  
  // Check if DOM is ready for operations
  const isDOMReady = React.useCallback(() => {
    return typeof document !== 'undefined' && 
           !!document?.body && 
           !!document?.documentElement;
  }, []);
  
  // Create a cleanup function for specified selectors
  const createCleanupFn = React.useCallback((selectors: string) => {
    return () => {
      if (!isDOMReady()) return;
      
      try {
        const elements = document.querySelectorAll(selectors);
        elements.forEach(element => {
          if (element instanceof HTMLElement) {
            safeRemoveElement(element);
          }
        });
      } catch (error) {
        console.warn(`Error cleaning up elements matching ${selectors}:`, error);
      }
    };
  }, [safeRemoveElement, isDOMReady]);
  
  // Find and remove all overlay elements (typically those with high z-index)
  const cleanupOverlays = React.useCallback(() => {
    try {
      // First attempt to use our registry
      registeredNodesRef.current.forEach(node => {
        if (node && node.parentNode) {
          try {
            node.parentNode.removeChild(node);
          } catch (err) {
            console.warn('Error removing registered node:', err);
          }
        }
      });
      registeredNodesRef.current.clear();
      
      // Then do a general cleanup of known overlay selectors
      if (typeof document !== 'undefined') {
        // For modals
        const modalOverlays = document.querySelectorAll('[data-state="open"][aria-modal="true"]');
        modalOverlays.forEach(overlay => {
          if (overlay.parentNode && overlay instanceof HTMLElement) {
            try {
              overlay.parentNode.removeChild(overlay);
            } catch (err) {
              // Just continue
            }
          }
        });
        
        // For drawer overlays
        const drawerOverlays = document.querySelectorAll('.vaul-drawer-overlay');
        drawerOverlays.forEach(overlay => {
          if (overlay.parentNode && overlay instanceof HTMLElement) {
            try {
              overlay.parentNode.removeChild(overlay);
            } catch (err) {
              // Just continue
            }
          }
        });
        
        // Reset body styles
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        document.body.classList.remove('overflow-hidden');
      }
    } catch (error) {
      console.warn('Error during overlay cleanup:', error);
    }
  }, []);
  
  return {
    safeRemoveElement,
    cleanupOverlays,
    registerNode,
    isDOMReady,
    createCleanupFn
  };
}
