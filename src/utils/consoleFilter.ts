/**
 * Utility to reduce console logs in production and filter noisy debug messages
 * This helps reduce the console noise in the admin dashboard
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Patterns to completely suppress
const SUPPRESSED_PATTERNS = [
  'user tracking',
  'already tracked',
  '[Tracking]',
  'admin session',
  'dashboard data',
  'Setting up admin',
  'Cleaning up',
  'No Supabase user',
  'processing user',
  'chat render',
  'Dashboard stats',
  'Support for defaultProps',
  'authenticat',
  'initializing',
  'Loading dashboard'
];

// Only allow 1 message per key in the specified timeframe (in ms)
const THROTTLED_MESSAGES: Record<string, number> = {};
const THROTTLE_INTERVAL = 10000; // 10 seconds

/**
 * Checks if a message should be suppressed based on patterns
 */
function shouldSuppressMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  // Convert the first argument to string if possible
  const firstArg = typeof args[0] === 'string' ? args[0] : 
    (args[0] && typeof args[0].toString === 'function') ? args[0].toString() : '';
  
  return SUPPRESSED_PATTERNS.some(pattern => firstArg.includes(pattern));
}

/**
 * Checks if a message should be throttled and returns true if it should be displayed
 */
function shouldThrottleMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  // Create a key from the first argument
  const key = typeof args[0] === 'string' ? args[0] :
    (args[0] && typeof args[0].toString === 'function') ? args[0].toString() : 
    'unknown';
    
  const now = Date.now();
  
  // If we haven't seen this message before or the throttle interval has passed
  if (!THROTTLED_MESSAGES[key] || now - THROTTLED_MESSAGES[key] > THROTTLE_INTERVAL) {
    THROTTLED_MESSAGES[key] = now;
    return false; // Don't throttle
  }
  
  return true; // Throttle the message
}

/**
 * Initialize the console filter
 */
export function initConsoleFilter() {
  // Override console methods to filter out noisy logs
  console.log = function(...args: any[]) {
    if (shouldSuppressMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.log(...args);
  };
  
  console.info = function(...args: any[]) {
    if (shouldSuppressMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.info(...args);
  };
  
  console.warn = function(...args: any[]) {
    if (shouldSuppressMessage(args)) return;
    originalConsole.warn(...args);
  };
  
  console.debug = function(...args: any[]) {
    if (shouldSuppressMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.debug(...args);
  };
  
  // We leave console.error unchanged for important error reporting
}

/**
 * Restore original console behavior
 */
export function restoreConsole() {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
}
