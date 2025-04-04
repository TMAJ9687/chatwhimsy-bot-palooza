
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { handleError } from '@/utils/errorHandler';

/**
 * A hook to provide error handling functionality with enhanced filter
 * for non-actionable errors like CORS, API rate limits, etc.
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  const showError = useCallback((message: string) => {
    // Filter out non-actionable errors related to external APIs
    if (message.includes('CORS') || 
        message.includes('ipapi.co') || 
        message.includes('ipgeolocation.io') ||
        message.includes('429') ||  // Too Many Requests
        message.includes('API_KEY_HERE')) {
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
    if (error instanceof Error) {
      const errorMessage = error.message;
      
      if (errorMessage.includes('CORS') || 
          errorMessage.includes('ipapi.co') || 
          errorMessage.includes('ipgeolocation.io') ||
          errorMessage.includes('429') ||  // Too Many Requests
          errorMessage.includes('API_KEY_HERE')) {
        console.debug('Filtered non-actionable error in captureError:', errorMessage);
        return;
      }
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
