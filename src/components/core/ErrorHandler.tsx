
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleError, setupGlobalErrorHandling } from '@/utils/errorHandler';
import { isNonActionableError } from '@/utils/safeErrorHandler';

const ErrorHandler: React.FC = () => {
  const [errorCount, setErrorCount] = useState(0);
  let toast;
  
  try {
    // Try to get the toast context, but don't crash if it's not available
    const toastContext = useToast();
    toast = toastContext.toast;
  } catch (error) {
    console.error('Toast context not available:', error);
    // Provide fallback
    toast = () => console.error('Toast unavailable - would show error');
  }
  
  // Set up global error handling on mount
  useEffect(() => {
    setupGlobalErrorHandling();
    
    const handleGlobalError = (event: ErrorEvent) => {
      // Skip handling for non-actionable errors
      if (isNonActionableError(event.message)) {
        event.preventDefault();
        return;
      }
      
      event.preventDefault();
      handleError(event.error || new Error(event.message));
      
      setErrorCount(prev => prev + 1);
      
      // Show a user-friendly error toast
      if (toast && errorCount < 3) { // Limit toasts to avoid spamming
        toast({
          title: "Something went wrong",
          description: "We're working on fixing the issue. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    // Handle unhandled promise rejections with enhanced filtering
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Promise rejection';
      
      // Skip handling for non-actionable errors
      if (isNonActionableError(errorMessage)) {
        event.preventDefault();
        return;
      }
      
      handleError(event.reason || new Error('Unhandled Promise rejection'));
      
      if (toast && errorCount < 3) {
        toast({
          title: "Something went wrong",
          description: "We're working on fixing the issue. Please try again.",
          variant: "destructive",
        });
      }
    };
    
    window.addEventListener('error', handleGlobalError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [toast, errorCount]);
  
  return null;
};

export default ErrorHandler;
