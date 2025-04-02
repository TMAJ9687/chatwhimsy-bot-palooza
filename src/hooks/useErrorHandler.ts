
import { useCallback } from 'react';
import { useToast } from './use-toast';
import { handleError } from '@/utils/errorHandler';

/**
 * A hook to provide error handling functionality
 */
export const useErrorHandler = () => {
  const { toast } = useToast();
  
  const showError = useCallback((message: string) => {
    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  }, [toast]);
  
  const captureError = useCallback((error: unknown, context?: string) => {
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
