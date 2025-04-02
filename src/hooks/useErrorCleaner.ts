
import { useEffect, useCallback } from 'react';
import { useToast } from './use-toast';

/**
 * A hook to help clean up UI errors and show user-friendly messages
 */
export const useErrorCleaner = () => {
  const { toast } = useToast();
  
  useEffect(() => {
    // Clear any "zombie" elements or orphaned overlays
    const cleanup = () => {
      // Use React state management instead of direct DOM manipulation
      console.log('Error cleaner running');
    };
    
    // Run cleanup on mount
    cleanup();
    
    // Run cleanup on unmount
    return cleanup;
  }, []);
  
  const handleError = useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context || 'application'}:`, error);
    
    toast({
      title: 'Something went wrong',
      description: error.message || 'Please try again or refresh the page',
      variant: 'destructive'
    });
    
  }, [toast]);
  
  return { handleError };
};

export default useErrorCleaner;
