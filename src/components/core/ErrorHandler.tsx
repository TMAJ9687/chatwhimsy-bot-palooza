
import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleError, setupGlobalErrorHandling } from '@/utils/errorHandler';

const ErrorHandler: React.FC = () => {
  const { toast } = useToast();
  
  // Set up global error handling on mount
  useEffect(() => {
    setupGlobalErrorHandling();
    
    const handleGlobalError = (event: ErrorEvent) => {
      event.preventDefault();
      handleError(event.error || new Error(event.message));
      
      // Show a user-friendly error toast
      toast({
        title: "Something went wrong",
        description: "We're working on fixing the issue. Please try again.",
        variant: "destructive",
      });
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, [toast]);
  
  return null;
};

export default ErrorHandler;
