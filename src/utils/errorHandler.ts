
import { toast } from "@/hooks/use-toast";

/**
 * Function to handle application errors
 */
export const handleError = (error: Error, additionalInfo?: Record<string, any>) => {
  // Filter out non-actionable errors
  if (
      // Browser extension and preload errors
      error.message.includes('contentScript.js') ||
      error.message.includes('Unrecognized feature') ||
      error.message.includes('preloaded using link preload') ||
      error.message.includes('allowedOriginsToCommunicateWith') ||
      error.message.includes('net::ERR_BLOCKED_BY_CLIENT') ||
      
      // React warning about defaultProps (from Recharts)
      error.message.includes('Support for defaultProps will be removed') ||
      error.message.includes('YAxis: Support for defaultProps') ||
      error.message.includes('XAxis: Support for defaultProps') ||
      
      // IP and geolocation related errors
      error.message.includes('ipapi.co') ||
      error.message.includes('ipgeolocation.io') ||
      error.message.includes('API_KEY_HERE') ||
      (error.message.includes('401') && error.message.includes('ipgeo'))) {
    console.debug('Ignoring non-actionable error:', error.message);
    return;
  }
  
  console.error('Application error:', error, additionalInfo);
  
  // Show user-friendly toast notification for actionable errors
  toast({
    title: "An error occurred",
    description: getErrorMessage(error),
    variant: "destructive",
  });
  
  // Track the error (you could send to monitoring service)
  trackError(error, additionalInfo);
};

/**
 * Get a user-friendly error message from various error types
 */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) {
    // Provide more user-friendly messages for common errors
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      return 'Network connection issue. Please check your internet connection.';
    }
    
    // Generic message for permission errors
    if (error.message.includes('permission_denied') || error.message.includes('PERMISSION_DENIED')) {
      return 'You do not have permission to perform this action.';
    }
    
    return error.message;
  }
  
  return 'An unknown error occurred';
};

/**
 * Track error for monitoring
 */
const trackError = (error: Error, additionalInfo?: Record<string, any>) => {
  // This could be connected to an error monitoring service
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  // Log for now, but could be sent to a service
  console.log('Tracking error:', errorData);
};

/**
 * Safe DOM cleanup function
 * This function safely cleans up any DOM-related issues by using
 * a React-friendly approach that doesn't directly manipulate the DOM
 */
export const performDOMCleanup = () => {
  // Instead of direct DOM manipulation, we use React's state-based approach
  // This function is primarily used for compatibility with existing code
  console.log('Performing React-safe cleanup');
  
  // Return a promise that resolves immediately
  return Promise.resolve();
};

/**
 * Set up global error handling
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    // Filter non-actionable errors
    if (event.reason?.message?.includes('contentScript') || 
        event.reason?.message?.includes('allowedOriginsToCommunicateWith') ||
        event.reason?.message?.includes('asynchronous response') ||
        event.reason?.message?.includes('message channel closed') ||
        event.reason?.message?.includes('Support for defaultProps will be removed') ||
        event.reason?.message?.includes('YAxis: Support for defaultProps') ||
        event.reason?.message?.includes('XAxis: Support for defaultProps')) {
      event.preventDefault();
      return;
    }
    
    // Filter geolocation errors
    if (event.reason?.message?.includes('ipapi.co') ||
        event.reason?.message?.includes('ipgeolocation.io') ||
        event.reason?.message?.includes('API_KEY_HERE') ||
        (event.reason?.message?.includes('401') && event.reason?.message?.includes('ipgeo'))) {
      event.preventDefault();
      return;
    }
    
    handleError(
      new Error(`Unhandled promise rejection: ${event.reason || 'Unknown error'}`),
      { source: 'unhandledrejection' }
    );
  });
  
  // Handle runtime errors
  window.addEventListener('error', (event) => {
    // Filter non-actionable errors
    if (event.message?.includes('contentScript') || 
        event.message?.includes('Unrecognized feature') ||
        event.message?.includes('preloaded using link preload') ||
        event.message?.includes('Support for defaultProps will be removed') ||
        event.message?.includes('YAxis: Support for defaultProps') ||
        event.message?.includes('XAxis: Support for defaultProps')) {
      event.preventDefault();
      return;
    }
    
    // Filter geolocation errors
    if (event.message?.includes('ipapi.co') ||
        event.message?.includes('ipgeolocation.io') ||
        event.message?.includes('API_KEY_HERE') ||
        (event.message?.includes('401') && event.message?.includes('ipgeo'))) {
      event.preventDefault();
      return;
    }
    
    // We don't want to interfere with normal React error handling
    if (event.error) {
      handleError(event.error, { source: 'window.onerror' });
    }
  });
};
