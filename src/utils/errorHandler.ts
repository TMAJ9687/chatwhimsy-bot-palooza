
import { domRegistry } from '@/services/dom';

/**
 * Creates a global error handler to catch and log errors
 */
export const createGlobalErrorHandler = () => {
  return (event: ErrorEvent) => {
    const errorMessage = event.error?.message || event.message || 'Unknown error';
    
    // Check if the error is a known React-related error
    if (
      errorMessage.includes('Minified React error') ||
      errorMessage.includes('ReactDOM') ||
      errorMessage.includes('React') ||
      errorMessage.includes('removeChild') ||
      errorMessage.includes('appendChild') ||
      errorMessage.includes('not a child')
    ) {
      event.preventDefault(); // Prevent default error handling
      console.warn('[ErrorHandler] Caught a React-related error:', errorMessage);
      
      // Perform DOM cleanup to try and recover
      performDOMCleanup();
    } else {
      // Log other errors to the console
      console.error('[ErrorHandler] Uncaught error:', errorMessage, event.error);
    }
  };
};

/**
 * Sets up global error handling for the application
 */
export const setupGlobalErrorHandling = () => {
  const errorHandler = createGlobalErrorHandler();
  
  // Add event listeners for errors
  window.addEventListener('error', errorHandler, { capture: true });
  
  // Also handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || String(event.reason);
    
    // Check if it's a DOM-related error
    if (
      errorMessage.includes('removeChild') ||
      errorMessage.includes('appendChild') ||
      errorMessage.includes('not a child')
    ) {
      event.preventDefault();
      performDOMCleanup();
    }
    
    console.error('[ErrorHandler] Unhandled promise rejection:', errorMessage);
  });
  
  // Run an initial cleanup to remove any stale elements
  performDOMCleanup();
};

/**
 * Performs a cleanup of any DOM elements that might cause issues with navigation
 */
export const performDOMCleanup = () => {
  try {
    // First reset body state
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Clean up any stray modal dialogs or overlays
    const overlays = document.querySelectorAll(
      '.fixed.inset-0, [role="dialog"], [aria-modal="true"], [data-radix-portal], .model-open, .dialog-open'
    );
    
    if (overlays.length > 0) {
      console.log(`Found ${overlays.length} overlay elements to clean up`);
      
      overlays.forEach((element: Element) => {
        try {
          if (!element.parentNode) {
            console.log('Element has no parent, skipping removal');
            return;
          }
          
          // Check if element is actually in the DOM
          if (!document.contains(element)) {
            console.log('Element is not in DOM, skipping removal');
            return;
          }
          
          // Double-check that it's actually a child of its parent node
          const parent = element.parentNode;
          const isChild = Array.from(parent.childNodes).includes(element as Node);
          
          if (!isChild) {
            console.log('Element is not a child of its parent, skipping removal');
            return;
          }
          
          // Now safely remove using the appropriate method
          try {
            // First try the safer element.remove() method
            element.remove();
          } catch (err) {
            console.log('Element.remove() failed, falling back to parentNode.removeChild');
            
            // Double-check parent relationship before removeChild
            if (parent && parent.contains(element)) {
              // Fix: Cast to ChildNode for removeChild
              parent.removeChild(element as ChildNode);
            } else {
              console.log('Parent no longer contains element, skipping removeChild');
            }
          }
        } catch (err) {
          console.warn('Error removing overlay element:', err);
        }
      });
    }
    
    // Also run the domRegistry cleanup
    domRegistry.cleanupOverlays();
  } catch (err) {
    console.warn('Error during performDOMCleanup:', err);
  }
};
