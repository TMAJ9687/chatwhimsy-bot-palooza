
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
    
    // Process in a microtask to avoid React DOM mutation issues
    queueMicrotask(() => {
      try {
        // Remove any problematic overlay elements - expanded list
        const selectors = [
          '.fixed.inset-0',
          '[data-radix-dialog-overlay]',
          '[data-radix-alert-dialog-overlay]',
          '.vaul-overlay',
          '[aria-modal="true"]',
          '[role="dialog"]',
          '.fixed[role="presentation"]',
          '.backdrop',
          '.modal-backdrop',
          '.fixed.z-50'
        ];
        
        // Process each selector in sequence
        selectors.forEach(selector => {
          try {
            // Use querySelectorAll to get all elements matching the selector
            const elements = document.querySelectorAll(selector);
            
            // Check if we found any elements
            if (elements.length > 0) {
              console.log(`[DOMCleanup] Found ${elements.length} elements matching ${selector}`);
            }
            
            // Safely remove each element
            elements.forEach(el => {
              try {
                if (!el.parentNode) {
                  // Skip elements without parents
                  return;
                }
                
                // First check if document still contains both the parent and element
                if (!document.contains(el) || !document.contains(el.parentNode)) {
                  return;
                }
                
                // Get all child nodes for comparison
                const allChildren = Array.from(el.parentNode.childNodes);
                
                // Check if element is still a child of its parent
                if (!allChildren.includes(el)) {
                  // Skip elements that aren't actually children
                  return;
                }
                
                // Additional check to ensure parent actually contains the element
                if (!el.parentNode.contains(el)) {
                  return;
                }
                
                // Try element.remove() first (modern browsers)
                try {
                  // Using remove() method which is available on Element type
                  el.remove();
                } catch (err) {
                  // Fallback to parentNode.removeChild
                  if (el.parentNode && document.contains(el.parentNode) && el.parentNode.contains(el)) {
                    // Make sure we only remove if all validation passes
                    el.parentNode.removeChild(el);
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
        
        // Final reset of body styles
        if (document.body) {
          document.body.style.overflow = 'auto';
          document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        }
      } catch (e) {
        console.warn('[DOMCleanup] Error in microtask cleanup:', e);
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
       event.message.includes('appendChild') ||
       event.message.includes('not a child')) &&
      (event.message.includes('not a child of this node') ||
       event.message.includes('Cannot read properties of null'))
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
        // Double-cast to satisfy TypeScript's type checking - Element is a valid ChildNode for removal
        element.parentNode.removeChild(element as unknown as ChildNode);
        return true;
      }
    }
    
    return false;
  } catch (err) {
    console.warn('[ErrorHandler] Error in safeRemoveElement:', err);
    return false;
  }
};
