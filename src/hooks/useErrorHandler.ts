
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { handleError } from '@/utils/errorHandler';
import { isNonActionableError } from '@/utils/safeErrorHandler';

/**
 * A hook to provide error handling functionality with enhanced filter
 * for non-actionable errors like CORS, API rate limits, etc.
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  const showError = useCallback((message: string) => {
    // Use the centralized non-actionable error filter
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
  
  const captureError = useCallback((error: unknown, context?: string) => {
    // Skip handling for non-actionable errors
    if (error instanceof Error && isNonActionableError(error)) {
      console.debug('Filtered non-actionable error in captureError:', error.message);
      return;
    }
    
    if (error instanceof Error) {
      handleError(error, { context });
    } else {
      handleError(new Error(String(error)), { context });
    }
  }, []);
  
  return {
    showError,
    captureError
  };
};

export default useErrorHandler;
