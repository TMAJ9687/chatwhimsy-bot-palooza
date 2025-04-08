
/**
 * A utility for safely handling errors without crashing the application
 */

// List of patterns for non-actionable errors
const NON_ACTIONABLE_ERROR_PATTERNS = [
  // API and network errors
  'ipapi.co', 'ipgeolocation', 'API_KEY_HERE', '429', 'Failed to fetch', 'CORS',
  // DOM errors
  'removeChild', 'is not a child of this node', 'Failed to execute',
  // React-specific errors
  'unmounted component', 'Cannot update a component',
  // React warnings for Recharts
  'Support for defaultProps will be removed',
  'YAxis: Support for defaultProps',
  'XAxis: Support for defaultProps',
  'CartesianAxis: Support for defaultProps',
  'Legend: Support for defaultProps',
  'Tooltip: Support for defaultProps',
  // Browser extensions
  'extension', 'contentScript',
  // Admin tracking
  'user tracking', 'User already tracked',
  // Socket
  'socket.io', 'WebSocket', 'Connection',
  // Admin-specific warnings
  'AdminChat', 'tracking user', 'user tracking', 'not found in tracking'
];

// Filter out common non-actionable errors that shouldn't crash the app
export const isNonActionableError = (error: Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return NON_ACTIONABLE_ERROR_PATTERNS.some(pattern => 
    errorMessage.includes(pattern)
  );
};

// Function to safely log errors without crashing the app
export const safeLogError = (error: unknown, context?: string): void => {
  try {
    if (error instanceof Error) {
      if (isNonActionableError(error)) {
        // Don't even log debug messages for these patterns
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
