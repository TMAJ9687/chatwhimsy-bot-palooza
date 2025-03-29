
/**
 * Global error handling utilities for the application
 */

import { domRegistry } from '@/services/dom';

/**
 * Class for handling global errors with proper DOM cleanup
 */
export class GlobalErrorHandler {
  /**
   * Handle an error with proper DOM cleanup
   */
  public handleError(error: any) {
    // Log the error
    console.error('[GlobalErrorHandler] Caught error:', error?.message || error);
    
    // Clean up DOM safely
    this.cleanupDom();
    
    // Return false to prevent default handling
    return false;
  }

  /**
   * Clean up DOM safely using proper ChildNode handling
   */
  private cleanupDom() {
    if (typeof document === 'undefined' || !document.body) return;
    
    try {
      // First reset body state
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
      
      // Clean up any overlay elements
      const overlaySelectors = [
        '.fixed.inset-0',
        '[role="dialog"]',
        '[aria-modal="true"]',
        '[data-radix-portal]',
        '.model-open',
        '.dialog-open',
        '.backdrop',
        '.modal-backdrop',
        '.vaul-overlay'
      ];
      
      overlaySelectors.forEach(selector => {
        try {
          const elements = document.querySelectorAll(selector);
          
          elements.forEach(element => {
            try {
              if (!element.parentNode) return;
              
              // Check if element is actually in the DOM
              if (!document.contains(element)) return;
              
              // Verify it's a child of its parent node
              const parent = element.parentNode;
              const parentChildNodes = Array.from(parent.childNodes);
              const isChild = parentChildNodes.includes(element as Node);
              
              if (!isChild) return;
              
              // Now safely remove using the appropriate method
              try {
                // Use the standard DOM removal method
                element.remove();
              } catch (err) {
                // Fallback with proper typing
                if (parent && parent.contains(element)) {
                  parent.removeChild(element as unknown as ChildNode);
                }
              }
            } catch (innerErr) {
              console.warn('[GlobalErrorHandler] Error removing element:', innerErr);
            }
          });
        } catch (err) {
          console.warn('[GlobalErrorHandler] Error selecting elements:', err);
        }
      });
      
      // Also run the domRegistry cleanup as an additional safety measure
      domRegistry.cleanupOverlays();
    } catch (err) {
      console.warn('[GlobalErrorHandler] Error during DOM cleanup:', err);
    }
  }
}

/**
 * Creates a global error handler to catch and log errors
 */
export const createGlobalErrorHandler = () => {
  const handler = new GlobalErrorHandler();
  
  return (event: ErrorEvent) => {
    const errorMessage = event.error?.message || event.message || 'Unknown error';
    
    // Check if the error is a known React-related or DOM error
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
      handler.handleError(event.error || errorMessage);
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
      const handler = new GlobalErrorHandler();
      handler.handleError(event.reason);
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
  const handler = new GlobalErrorHandler();
  handler.handleError({ message: "Triggered cleanup" });
};
