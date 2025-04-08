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
  'Loading dashboard',
  'Auth state changed',
  'checking admin status',
  'Check auth',
  'admin auth',
  'Admin verified',
  'auth listener',
  'Checking auth',
  'verified via',
  'No session found',
  'localStorage',
  'admin data load',
  'performance',
  'Performance',
  'failed attempts',
  'setAdminData',
  'session check',
  'info loading',
  'periodic',
  'Periodic',
  'Setting up Supabase',
  'Supabase auth state',
  'AuthListener',
  'Loaded user from',
  'is on public path',
  'logged out',
  'useEffect cleanup',
  'User is on path',
  'No active session',
  'function waitUntil'
];

// Only allow 1 message per key in the specified timeframe (in ms)
const THROTTLED_MESSAGES: Record<string, number> = {};
const THROTTLE_INTERVAL = 60000; // Increased to 60 seconds

// Track total counts of suppressed messages for debugging
let suppressedCount = 0;
let throttledCount = 0;

// Tracking for init status
let isInitialized = false;

/**
 * Checks if a message should be suppressed based on patterns
 */
function shouldSuppressMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  // Convert the first argument to string if possible
  const firstArg = typeof args[0] === 'string' ? args[0] : 
    (args[0] && typeof args[0].toString === 'function') ? args[0].toString() : '';
  
  const shouldSuppress = SUPPRESSED_PATTERNS.some(pattern => firstArg.includes(pattern));
  
  if (shouldSuppress) {
    suppressedCount++;
    return true;
  }
  
  return shouldSuppress;
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
  
  throttledCount++;
  return true; // Throttle the message
}

/**
 * Initialize the console filter
 */
export function initConsoleFilter() {
  // Prevent multiple initializations
  if (isInitialized) {
    return;
  }
  
  // Mark as initialized immediately to prevent race conditions
  isInitialized = true;
  
  // Reset counters
  suppressedCount = 0;
  throttledCount = 0;
  
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
  // But still apply pattern filtering for known noise
  console.error = function(...args: any[]) {
    if (shouldSuppressMessage(args)) return;
    originalConsole.error(...args);
  };
  
  // Log once that the filter is active - useful for debugging
  originalConsole.log('[Console Filter] Initialized and active');
}

/**
 * Restore original console behavior
 */
export function restoreConsole() {
  // Only restore if we've actually initialized
  if (!isInitialized) {
    return;
  }
  
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  
  isInitialized = false;
  
  // No need to log stats when restoring - it can cause console spam during hot reloads
}
