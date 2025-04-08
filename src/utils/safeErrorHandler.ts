
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
  'AdminChat', 'tracking user', 'user tracking', 'not found in tracking',
  // Additional patterns to suppress
  'supabase', 'auth', 'admin', 'dashboard', 'performance', 'render',
  'effect', 'hook', 'state', 'update', 'function', 'component',
  'loading', 'load', 'track', 'user', 'bot', 'online', 'status',
  'initialize', 'clean', 'cleanup', 'event', 'listener', 'subscribe',
  'timeout', 'interval', 'effect', 'dependency', 'tab', 'console'
];

// Filter out common non-actionable errors that shouldn't crash the app
export const isNonActionableError = (error: Error | string): boolean => {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return NON_ACTIONABLE_ERROR_PATTERNS.some(pattern => 
    errorMessage.toLowerCase().includes(pattern.toLowerCase())
  );
};

// Function to safely log errors without crashing the app
export const safeLogError = (error: unknown, context?: string): void => {
  // By default, suppress almost all errors to prevent console flooding
  if (error instanceof Error) {
    if (isNonActionableError(error)) {
      // Don't even log debug messages for these patterns
      return;
    }
    
    // Only log truly critical errors
    if (error.message.includes('critical') || 
        error.message.includes('fatal') || 
        error.message.includes('crash')) {
      console.error(`[Error${context ? ` - ${context}` : ''}]:`, error.message);
    }
  } else if (typeof error === 'string' && error.includes('critical')) {
    console.error(`[Error${context ? ` - ${context}` : ''}]:`, error);
  }
};

// Generic error handler function - silently handle most errors
export const safeHandleError = <T>(
  promise: Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> => {
  return promise.catch(error => {
    // Only log critical errors
    if (error instanceof Error && 
        (error.message.includes('critical') || 
         error.message.includes('fatal') || 
         error.message.includes('crash'))) {
      safeLogError(error, context);
    }
    return fallbackValue;
  });
};
