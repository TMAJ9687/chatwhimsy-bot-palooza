
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
    };
    
    window.addEventListener('error', handleGlobalError);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
  }, []);
  
  return null;
};

export default ErrorHandler;
