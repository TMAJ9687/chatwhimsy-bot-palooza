
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
  
  // Enhanced filter for non-actionable errors
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
    if (errorText.includes('preloaded using link preload') || 
        errorText.includes('net::ERR_BLOCKED_BY_CLIENT')) {
      event.preventDefault();
      return true;
    }
    
    // Filter out IP geolocation errors
    if (errorText.includes('ipapi.co') ||
        errorText.includes('ipgeolocation.io') ||
        errorText.includes('401') ||
        errorText.includes('API_KEY_HERE') ||
        errorText.includes('429')) {
      event.preventDefault();
      return true;
    }
    
    // Filter out any Firebase-related errors completely
    if (errorText.includes('firebase') || 
        errorText.includes('Firestore') || 
        errorText.includes('firestore') ||
        errorText.includes('BloomFilter error') ||
        errorText.includes('Failed to load resource: the server responded with a status of 400')) {
      event.preventDefault();
      return true;
    }
    
    // Filter out message channel errors
    if (errorText.includes('message channel closed') ||
        errorText.includes('asynchronous response')) {
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
    
    // Handle unhandled promise rejections with enhanced filtering
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const errorMessage = event.reason?.message || 'Promise rejection';
      
      // Skip handling for non-actionable errors
      if (errorMessage.includes('firebase') || 
          errorMessage.includes('Firestore') ||
          errorMessage.includes('firestore') ||
          errorMessage.includes('contentScript') ||
          errorMessage.includes('allowedOriginsToCommunicateWith') ||
          errorMessage.includes('message channel closed') ||
          errorMessage.includes('asynchronous response') ||
          errorMessage.includes('API_KEY_HERE') ||
          errorMessage.includes('ipapi.co') ||
          errorMessage.includes('ipgeolocation.io') ||
          (errorMessage.includes('401') && errorMessage.includes('ipgeo'))) {
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
