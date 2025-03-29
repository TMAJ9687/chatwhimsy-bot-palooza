
/**
 * Global error handler utilities to handle DOM-related errors
 */

/**
 * Safely performs DOM cleanup when a DOM error is detected
 */
export const performDOMCleanup = () => {
  try {
    console.log('[DOMCleanup] Running DOM cleanup before navigation');
    
    // Reset body styles
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Remove any problematic overlay elements
    const selectors = [
      '.fixed.inset-0',
      '[data-radix-dialog-overlay]',
      '[data-radix-alert-dialog-overlay]',
      '.vaul-overlay',
      '[aria-modal="true"]',
      '[role="dialog"]'
    ];
    
    selectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(el => {
          try {
            if (el.parentNode) {
              // First verify it's actually a child of its parent
              const parent = el.parentNode;
              const isRealChild = Array.from(parent.childNodes).includes(el);
              
              if (isRealChild) {
                // Try safest removal method first
                try {
                  // Cast the element to Element type which has remove() method
                  (el as Element).remove();
                } catch (err) {
                  // Fallback to parent.removeChild with verification
                  if (parent.contains(el)) {
                    parent.removeChild(el);
                  }
                }
              }
            }
          } catch (err) {
            // Ignore individual element errors
          }
        });
      } catch (err) {
        // Ignore selector errors
      }
    });
    
    // Additional cleanup for known issues with animation frames
    requestAnimationFrame(() => {
      try {
        // One more sweep after a frame to catch any remaining issues
        selectors.forEach(selector => {
          try {
            document.querySelectorAll(selector).forEach(el => {
              try {
                if (el.parentNode && document.contains(el)) {
                  // Make sure to cast to Element type here too
                  (el as Element).remove();
                }
              } catch (e) {
                // Ignore errors
              }
            });
          } catch (e) {
            // Ignore errors
          }
        });
      } catch (e) {
        // Ignore errors in animation frame
      }
    });
  } catch (error) {
    console.warn('[DOMCleanup] Error during DOM cleanup:', error);
  }
};

/**
 * Create a global error handler that can be attached to the window
 */
export const createGlobalErrorHandler = () => {
  return (event: ErrorEvent) => {
    // Check if this is a DOM removal error
    if (
      event.message &&
      (event.message.includes('removeChild') || 
       event.message.includes('appendChild')) &&
      event.message.includes('not a child')
    ) {
      // Prevent default behavior
      event.preventDefault();
      console.warn('[ErrorHandler] Caught DOM manipulation error, cleaning up', event.message);
      
      // Run cleanup
      performDOMCleanup();
      
      return false;
    }
  };
};

/**
 * Setup global error handling
 */
export const setupGlobalErrorHandling = () => {
  const errorHandler = createGlobalErrorHandler();
  
  // Use capture phase to catch errors before they propagate
  window.addEventListener('error', errorHandler, { capture: true });
  
  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || String(event.reason);
    
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('appendChild') || 
      errorMessage.includes('not a child')
    ) {
      event.preventDefault();
      console.warn('[ErrorHandler] Unhandled promise rejection with DOM error:', errorMessage);
      performDOMCleanup();
    }
  }, { capture: true });
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('error', errorHandler, { capture: true });
  };
};

/**
 * Checks the validity of a parent-child relationship before DOM operations
 */
export const isValidChildOfParent = (child: Node, parent: Node): boolean => {
  try {
    if (!child || !parent) return false;
    
    // Check direct containment
    if (!parent.contains(child)) return false;
    
    // Double-check with childNodes (more reliable)
    return Array.from(parent.childNodes).includes(child);
  } catch (e) {
    console.warn('[ErrorHandler] Error checking parent-child relationship:', e);
    return false;
  }
};

/**
 * Safely remove a DOM element with parent-child validation
 */
export const safeRemoveElement = (element: Element): boolean => {
  try {
    if (!element || !element.parentNode) return false;
    
    // First validate the parent-child relationship
    if (!isValidChildOfParent(element, element.parentNode)) {
      console.warn('[ErrorHandler] Invalid parent-child relationship, skipping removal');
      return false;
    }
    
    // Try the safer remove() method first
    try {
      element.remove();
      return true;
    } catch (err) {
      console.warn('[ErrorHandler] element.remove() failed, trying removeChild:', err);
      
      // Fallback to removeChild with re-verification
      if (element.parentNode && isValidChildOfParent(element, element.parentNode)) {
        element.parentNode.removeChild(element);
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.warn('[ErrorHandler] Error in safeRemoveElement:', err);
    return false;
  }
};
