
import { toast } from '@/hooks/use-toast';

// Singleton instance for DOM operations registry
let domCleanupRegistered = false;
let lastErrorTimestamp = 0;
let errorCount = 0;
const MAX_ERRORS_BEFORE_RELOAD = 5;
const ERROR_DEBOUNCE_MS = 5000;

/**
 * Set up error handling throughout the application
 */
export const setupErrorHandling = () => {
  if (domCleanupRegistered) return;
  domCleanupRegistered = true;
  
  console.log('Setting up error handlers');
  
  // Set up global error handlers
  window.addEventListener('error', (event) => {
    handleGlobalError(event);
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    handleGlobalError({ message: event.reason?.message || 'Unhandled Promise rejection' });
  });
};

/**
 * Handle a global error, with DOM cleanup if necessary
 */
export const handleGlobalError = (error: any): void => {
  const now = Date.now();
  const errorMessage = error.message || String(error);
  
  // Simple debouncing mechanism to avoid too many cleanups
  if (now - lastErrorTimestamp < ERROR_DEBOUNCE_MS) {
    console.warn('Error occurred too soon after previous error, skipping cleanup');
    errorCount++;
    
    // Too many errors in short succession, reload the page
    if (errorCount > MAX_ERRORS_BEFORE_RELOAD) {
      console.error('Too many errors, forcing reload');
      window.location.reload();
      return;
    }
    
    return;
  }
  
  // Reset error count if enough time has passed
  lastErrorTimestamp = now;
  errorCount = 1;
  
  // Check for DOM-related errors that need cleanup
  if (
    errorMessage.includes('removeChild') ||
    errorMessage.includes('appendChild') ||
    errorMessage.includes('The node to be removed is not a') ||
    errorMessage.includes('Failed to execute') && errorMessage.includes('on') && errorMessage.includes('Element') ||
    errorMessage.includes('null') && errorMessage.includes('DOM')
  ) {
    console.warn('DOM-related error detected, performing cleanup:', errorMessage);
    performDOMCleanup();
    
    // For critical DOM errors, show a toast
    if (errorMessage.includes('removeChild') || errorMessage.includes('appendChild')) {
      toast({
        title: 'UI Error Detected',
        description: 'An error occurred with the interface. It has been automatically fixed.',
        variant: 'destructive'
      });
    }
  }
};

/**
 * Perform DOM cleanup to fix potential issues
 */
export const performDOMCleanup = (): void => {
  if (typeof document === 'undefined' || !document.body) return;
  
  console.log('Performing emergency DOM cleanup');
  
  try {
    // Reset body state
    document.body.style.overflow = 'auto';
    document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
    
    // Clean up potential modal-related elements
    const overlaySelectors = [
      '.fixed.inset-0',
      '.fixed.z-50',
      '[role="dialog"]',
      '[aria-modal="true"]',
      '[data-radix-dialog-overlay]',
      '[data-radix-alert-dialog-overlay]',
      '.backdrop',
      '.modal-backdrop'
    ];
    
    // Process each selector
    overlaySelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(element => {
          try {
            // Ensure element is in DOM and has a parent
            if (element.parentNode && document.contains(element)) {
              // Check if the element is truly a child of its parent
              const childNodes = Array.from(element.parentNode.childNodes);
              if (childNodes.includes(element as Node)) {
                try {
                  // First try the modern remove() method
                  element.remove();
                } catch (e) {
                  // If that fails, try removeChild with proper type assertion and additional checks
                  if (element.parentNode && element.parentNode.contains(element) && element instanceof Element) {
                    element.parentNode.removeChild(element);
                  }
                }
              }
            }
          } catch (innerError) {
            console.warn('Error removing individual element:', innerError);
          }
        });
      } catch (selectorError) {
        console.warn(`Error processing selector ${selector}:`, selectorError);
      }
    });
  } catch (cleanupError) {
    console.error('Error during DOM cleanup:', cleanupError);
  }
};
