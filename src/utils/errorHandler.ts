
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
      
      overlays.forEach(node => {
        try {
          if (node.parentNode) {
            // Use proper type checking before removing
            if (node instanceof Element) {
              try {
                node.remove();
              } catch (err) {
                // Fallback to removeChild with proper parent check
                if (node.parentNode) {
                  node.parentNode.removeChild(node);
                }
              }
            } else if (node.parentNode) {
              // For non-Element nodes, use removeChild
              node.parentNode.removeChild(node);
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
