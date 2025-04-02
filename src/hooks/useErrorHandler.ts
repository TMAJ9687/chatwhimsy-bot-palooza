
import { useEffect } from 'react';
import { performDOMCleanup } from '@/utils/errorHandler';

interface ErrorHandlerOptions {
  onError?: () => void;
}

/**
 * Custom hook to handle errors and perform UI cleanup when errors occur
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { onError } = options;
  
  useEffect(() => {
    // Maximum allowed errors in a time window before stopping execution
    let errorCount = 0;
    const MAX_ERRORS = 20;
    const ERROR_WINDOW_MS = 2000;
    let windowStartTime = Date.now();
    
    const handleError = (event: ErrorEvent) => {
      // Check if we're in a potential infinite loop
      const currentTime = Date.now();
      if (currentTime - windowStartTime > ERROR_WINDOW_MS) {
        // Reset counter if the window has expired
        errorCount = 0;
        windowStartTime = currentTime;
      }
      
      errorCount++;
      
      // If error threshold is exceeded, we might be in an infinite loop
      if (errorCount > MAX_ERRORS) {
        console.warn('Possible infinite loop detected. Stopping cascade of errors.');
        return;
      }
      
      if (
        // Check if this is a DOM error, SVG error, or React error
        (event.message && 
         (event.message.includes('not a child') || 
          event.message.includes('Failed to execute') ||
          event.message.includes('could not be found') ||
          event.message.includes('SVG'))) ||
        // Special case for SVG icon errors
        (event.message && event.message.includes('Error loading icon'))
      ) {
        console.warn('Caught error event, cleaning up:', event.message);
        
        // Run DOM cleanup
        performDOMCleanup();
        
        // Call custom error handler if provided
        if (typeof onError === 'function') {
          setTimeout(() => onError(), 0);
        }
        
        // Prevent default behavior for certain errors
        if (event.message.includes('not a child')) {
          event.preventDefault();
          return false;
        }
      }
    };
    
    window.addEventListener('error', handleError, { capture: true });
    
    // Also handle unhandled promise rejections
    const handleRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || String(event.reason);
      
      if (
        (errorMessage.includes('not a child') || 
         errorMessage.includes('Failed to execute') ||
         errorMessage.includes('could not be found') ||
         errorMessage.includes('SVG'))
      ) {
        console.warn('Unhandled promise rejection with DOM error:', errorMessage);
        
        // Run DOM cleanup
        performDOMCleanup();
        
        // Call custom error handler if provided
        if (typeof onError === 'function') {
          setTimeout(() => onError(), 0);
        }
      }
    };
    
    window.addEventListener('unhandledrejection', handleRejection);
    
    return () => {
      window.removeEventListener('error', handleError, { capture: true });
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, [onError]);
};
