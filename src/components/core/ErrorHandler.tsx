
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { handleError, setupGlobalErrorHandling } from '@/utils/errorHandler';

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
  
  // Filter out non-actionable errors
  const filterNonActionableErrors = (event: ErrorEvent) => {
    const errorText = event.message || '';
    
    // Ignore browser extension related errors
    if (errorText.includes('contentScript.js') || 
        errorText.includes('extension') ||
        errorText.includes('Unrecognized feature') ||
        errorText.includes('allowedOriginsToCommunicateWith')) {
      event.preventDefault();
      return true;
    }
    
    // Ignore preload warnings
    if (errorText.includes('preloaded using link preload but not used')) {
      event.preventDefault();
      return true;
    }
    
    // Filter out Firebase-related errors as we're migrating away from it
    if (errorText.includes('firebase') || errorText.includes('Firestore')) {
      event.preventDefault();
      return true;
    }
    
    return false;
  };
  
  // Set up global error handling on mount
  useEffect(() => {
    setupGlobalErrorHandling();
    
    const handleGlobalError = (event: ErrorEvent) => {
      // Skip handling for non-actionable errors
      if (filterNonActionableErrors(event)) {
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
    
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Promise rejection';
      
      // Skip handling for non-actionable errors
      if (errorMessage.includes('firebase') || 
          errorMessage.includes('Firestore') ||
          errorMessage.includes('contentScript') ||
          errorMessage.includes('allowedOriginsToCommunicateWith')) {
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
    
    // Cleanup console if needed
    if (typeof console.clear === 'function' && process.env.NODE_ENV === 'production') {
      console.clear();
    }
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [toast, errorCount]);
  
  return null;
};

export default ErrorHandler;
