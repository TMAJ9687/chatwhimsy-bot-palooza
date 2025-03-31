
import { toast } from '@/hooks/use-toast';
import { safeRemoveElement, resetBodyState } from '@/utils/domUtils';

// Singleton instance for DOM operations registry
let domCleanupRegistered = false;
let lastErrorTimestamp = 0;
let errorCount = 0;
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
  
  // Simple debouncing mechanism
  if (now - lastErrorTimestamp < ERROR_DEBOUNCE_MS) {
    console.warn('Error occurred too soon after previous error, skipping cleanup');
    errorCount++;
    return;
  }
  
  // Reset error count if enough time has passed
  lastErrorTimestamp = now;
  errorCount = 1;
  
  // For critical errors, show a toast
  if (errorMessage.includes('failed to load') || errorMessage.includes('Failed to fetch')) {
    toast({
      title: 'Connection Error',
      description: 'There was a problem connecting to the server.',
      variant: 'destructive'
    });
  }
};

/**
 * Perform DOM cleanup to fix potential issues
 * This is now a simplified version that just resets body state
 */
export const performDOMCleanup = (): void => {
  if (typeof document === 'undefined' || !document.body) return;
  
  console.log('Performing basic DOM cleanup');
  
  try {
    // Reset body state
    resetBodyState();
    
    // Clean up any overlay elements that might be stuck
    const overlaySelectors = [
      '.fixed.inset-0',
      '[data-radix-dialog-overlay]',
      '[data-radix-alert-dialog-overlay]',
      '.modal-backdrop',
      '[role="dialog"]'
    ];
    
    // Process each selector
    overlaySelectors.forEach(selector => {
      try {
        document.querySelectorAll(selector).forEach(element => {
          safeRemoveElement(element);
        });
      } catch (e) {
        console.warn(`Error cleaning up selector ${selector}:`, e);
      }
    });
  } catch (cleanupError) {
    console.error('Error during DOM cleanup:', cleanupError);
  }
};
