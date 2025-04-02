
/**
 * Global error handler utilities to handle DOM-related errors without circular dependencies
 */

/**
 * Safely performs DOM cleanup when a DOM error is detected
 */
export const performDOMCleanup = () => {
  try {
    // Reset body styles
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Remove any problematic overlay elements with careful validation
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
                  el.remove();
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
  } catch (error) {
    console.warn('Error during DOM cleanup:', error);
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
      console.warn('Caught DOM manipulation error, cleaning up', event.message);
      
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
      console.warn('Unhandled promise rejection with DOM error:', errorMessage);
      performDOMCleanup();
    }
  }, { capture: true });
  
  // Return a cleanup function
  return () => {
    window.removeEventListener('error', errorHandler, { capture: true });
  };
};
