
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { handleError } from '@/utils/errorHandler';
import { isNonActionableError, safeLogError } from '@/utils/safeErrorHandler';

/**
 * A hook to provide error handling functionality with enhanced filter
 * for non-actionable errors like CORS, API rate limits, etc.
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  // Display user-friendly error message
  const showError = useCallback((message: string) => {
    // Skip non-actionable errors
    if (isNonActionableError(message)) {
      console.debug('Filtered non-actionable error:', message);
      return;
    }
    
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);
  
  // Capture and log error with context
  const captureError = useCallback((error: unknown, context?: string) => {
    // Skip handling for non-actionable errors
    if (error instanceof Error && isNonActionableError(error)) {
      console.debug('Filtered non-actionable error in captureError:', error.message);
      return;
    }
    
    // Use the centralized error handler
    const errorObj = error instanceof Error 
      ? error 
      : new Error(String(error));
    
    handleError(errorObj, { context });
  }, []);
  
  // Log but don't show to user
  const logError = useCallback((error: unknown, context?: string) => {
    safeLogError(error, context);
  }, []);
  
  return {
    showError,
    captureError,
    logError
  };
};

export default useErrorHandler;
