
/**
 * A utility for safely handling errors without crashing the application
 */

// Filter out common non-actionable errors that shouldn't crash the app
export const isNonActionableError = (error: Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    // API and network errors
    errorMessage.includes('ipapi.co') ||
    errorMessage.includes('ipgeolocation') ||
    errorMessage.includes('API_KEY_HERE') ||
    errorMessage.includes('429') ||
    errorMessage.includes('Failed to fetch') ||
    errorMessage.includes('CORS') ||
    
    // DOM errors
    errorMessage.includes('removeChild') ||
    errorMessage.includes('is not a child of this node') ||
    errorMessage.includes('Failed to execute') ||
    
    // React-specific errors during mount/unmount
    errorMessage.includes('unmounted component') ||
    errorMessage.includes('Cannot update a component') ||
    
    // React warnings for Recharts
    errorMessage.includes('Support for defaultProps will be removed') ||
    errorMessage.includes('YAxis: Support for defaultProps') ||
    errorMessage.includes('XAxis: Support for defaultProps') ||
    errorMessage.includes('CartesianAxis: Support for defaultProps') ||
    errorMessage.includes('Legend: Support for defaultProps') ||
    errorMessage.includes('Tooltip: Support for defaultProps') ||
    
    // Browser extensions
    errorMessage.includes('extension') ||
    errorMessage.includes('contentScript')
  );
};

// Function to safely log errors without crashing the app
export const safeLogError = (error: unknown, context?: string): void => {
  try {
    if (error instanceof Error) {
      if (isNonActionableError(error)) {
        console.debug(`[Filtered Error${context ? ` - ${context}` : ''}]:`, error.message);
        return;
      }
      console.error(`[Error${context ? ` - ${context}` : ''}]:`, error.message, error.stack);
    } else {
      console.error(`[Unknown Error${context ? ` - ${context}` : ''}]:`, error);
    }
  } catch (e) {
    // Failsafe in case logging itself causes an error
    console.debug('Error during error logging:', e);
  }
};

// Generic error handler function
export const safeHandleError = <T>(
  promise: Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> => {
  return promise.catch(error => {
    safeLogError(error, context);
    return fallbackValue;
  });
};
