
import { toast } from "@/hooks/use-toast";

/**
 * Function to handle application errors
 */
export const handleError = (error: Error, additionalInfo?: Record<string, any>) => {
  console.error('Application error:', error, additionalInfo);
  
  // Show user-friendly toast notification
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
 * Set up global error handling
 */
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    handleError(
      new Error(`Unhandled promise rejection: ${event.reason || 'Unknown error'}`),
      { source: 'unhandledrejection' }
    );
  });
  
  // Handle runtime errors
  window.addEventListener('error', (event) => {
    // We don't want to interfere with normal React error handling
    if (event.error) {
      handleError(event.error, { source: 'window.onerror' });
    }
  });
};
