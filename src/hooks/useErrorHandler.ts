
import { useEffect, useCallback } from 'react';
import { useUIState } from '@/context/UIStateContext';

interface ErrorHandlerOptions {
  onError?: (error: Error | ErrorEvent | PromiseRejectionEvent) => void;
}

/**
 * Hook to handle DOM errors declaratively
 */
export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const { recordError, clearError } = useUIState();
  const { onError } = options;

  // Handle DOM errors
  const handleDOMError = useCallback((event: ErrorEvent) => {
    // Check if it's a DOM-related error
    if (
      event.message && 
      (event.message.includes('removeChild') || 
       event.message.includes('appendChild') || 
       event.message.includes('not a child'))
    ) {
      // Prevent default behavior
      event.preventDefault();
      
      // Record the error
      recordError(event.message);
      
      // Call the provided error handler
      if (onError) {
        onError(event);
      }
      
      return false;
    }
  }, [recordError, onError]);

  // Handle unhandled promise rejections
  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    const errorMessage = event.reason?.message || String(event.reason);
    
    if (
      errorMessage.includes('removeChild') || 
      errorMessage.includes('appendChild') || 
      errorMessage.includes('not a child')
    ) {
      // Prevent default behavior
      event.preventDefault();
      
      // Record the error
      recordError(errorMessage);
      
      // Call the provided error handler
      if (onError) {
        onError(event);
      }
      
      return false;
    }
  }, [recordError, onError]);

  // Set up error handling
  useEffect(() => {
    // Register global error handlers
    window.addEventListener('error', handleDOMError, { capture: true });
    window.addEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    
    // Clean up on unmount
    return () => {
      window.removeEventListener('error', handleDOMError, { capture: true });
      window.removeEventListener('unhandledrejection', handleUnhandledRejection, { capture: true });
    };
  }, [handleDOMError, handleUnhandledRejection]);

  return {
    clearError,
    handleError: (error: Error) => {
      recordError(error.message);
      if (onError) {
        onError(error);
      }
    }
  };
};
