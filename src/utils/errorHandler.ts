
// Import DOM safety utilities
import { domRegistry } from '@/services/dom';

/**
 * Clean up DOM elements that might cause issues or block the UI
 * This is particularly important for modal dialogs and overlays
 */
export const performDOMCleanup = (): void => {
  try {
    console.log('Performing emergency DOM cleanup');
    
    // Reset body state first
    if (document.body) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    }
    
    // Use dom registry if available
    if (domRegistry) {
      domRegistry.cleanupOverlays();
    }
    
    // Additional cleanup for persistent overlay elements
    const overlaySelectors = [
      '.fixed.inset-0',
      '[data-radix-dialog-overlay]',
      '[data-radix-alert-dialog-overlay]',
      '[data-radix-portal]',
      '[role="dialog"]',
      '[aria-modal="true"]',
      '.backdrop',
      '.modal-backdrop'
    ];
    
    // Process each selector
    overlaySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          try {
            if (element.parentNode) {
              // Verify element is a child before removing
              const children = Array.from(element.parentNode.childNodes);
              if (children.includes(element as Node)) {
                try {
                  // Try the standard remove method first
                  element.remove();
                } catch (e) {
                  // If that fails, try removeChild with proper type assertion
                  if (element.parentNode && element.parentNode.contains(element)) {
                    element.parentNode.removeChild(element as unknown as ChildNode);
                  }
                }
              }
            }
          } catch (e) {
            console.warn(`Error removing element with selector ${selector}:`, e);
          }
        });
      } catch (e) {
        console.warn(`Error processing selector ${selector}:`, e);
      }
    });
  } catch (e) {
    console.error('Error during DOM cleanup:', e);
  }
};

/**
 * Global handler for runtime errors including DOM related errors
 */
export const handleGlobalError = (error: any): void => {
  console.error('Global error handler caught:', error);
  
  // Check if this is a DOM-related error
  if (
    error && error.message && (
      error.message.includes('removeChild') ||
      error.message.includes('child of this node') ||
      error.message.includes('Failed to execute') ||
      error.message.includes('dynamically imported module')
    )
  ) {
    console.warn('DOM-related error detected, performing cleanup');
    performDOMCleanup();
  }
};

/**
 * Set up global error handling
 */
export const setupErrorHandling = (): void => {
  if (typeof window !== 'undefined') {
    // Set up global error handler
    window.addEventListener('error', (event) => {
      handleGlobalError(event.error || event);
    });
    
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      handleGlobalError(event.reason);
    });
  }
};
