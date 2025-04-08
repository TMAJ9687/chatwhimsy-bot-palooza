
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
  // Admin dashboard specific patterns
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
  'function waitUntil',
  // Additional patterns to suppress
  'Dashboard data load',
  'dashboard render',
  'useAdmin',
  'useAdminBots',
  'loading bots',
  'admin data',
  'initialized',
  'checking if',
  'auth.onAuth',
  'tracking user',
  'online status',
  'tab change',
  'switched to tab',
  'effect ran',
  'firing effect',
  'rerender',
  'useCallback called',
  'ref update',
  'addEventListener',
  'removeEventListener',
  'useEffect cleanup',
  'subscription',
  'refresh token',
  'state update',
  'ref current',
  'tabsContent',
  'rendered',
  'component mounted',
  'component updated',
  'data fetched',
  'dependency changed',
  'loadDashboardData',
  'loadBots',
  'loadingRef',
  'already processing',
  'throttled',
  'already in progress',
  'Skip loading',
  'skipping update',
  'user online',
  'admin tracking',
  'User tracking',
  'Total online',
  'Dashboard',
  'admin hook',
  'mounted',
  'unmounted',
  'timeout',
  'interval',
  'loading state',
  'update state',
  'effect fired',
  'toggle',
  'cleanup',
  'trigger',
  'load data',
  'Getting',
  'starting',
  'processing',
  'finished',
  'started',
  'completed',
  'supabase',
  'auth state',
  'session',
  'render cycle',
  'state changed',
  'current state',
  'updating state',
  'render update',
  'memo',
  'callback',
  'useRef',
  'Dependencies',
  'setInterval',
  'clearInterval',
  'setTimeout',
  'clearTimeout',
  'Starting admin',
  'Ending admin',
  'Starting load',
  'Ending load',
  'Start process',
  'End process'
];

// Severely throttle messages - only allow 1 per key per much longer interval
const THROTTLED_MESSAGES: Record<string, number> = {};
const THROTTLE_INTERVAL = 300000; // 5 minutes (increased from 60 seconds)

// Ultra-high throttling for certain patterns - only allow once per session
const SEEN_MESSAGES = new Set<string>();

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
  
  // Convert all arguments to a single string for pattern matching
  const messageString = args.map(arg => 
    typeof arg === 'string' ? arg : 
    (arg && typeof arg.toString === 'function') ? arg.toString() : 
    JSON.stringify(arg)
  ).join(' ');
  
  const shouldSuppress = SUPPRESSED_PATTERNS.some(pattern => messageString.toLowerCase().includes(pattern.toLowerCase()));
  
  if (shouldSuppress) {
    suppressedCount++;
    return true;
  }
  
  return shouldSuppress;
}

/**
 * Checks if a message should be throttled and returns true if it should be suppressed
 */
function shouldThrottleMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  // Create a key from all arguments
  const key = args.map(arg => 
    typeof arg === 'string' ? arg : 
    (arg && typeof arg.toString === 'function') ? arg.toString() : 
    JSON.stringify(arg)
  ).join('|').substring(0, 100); // Limit key length
  
  // Check if we've seen this exact message before - if so, suppress completely
  if (SEEN_MESSAGES.has(key)) {
    return true;
  }
    
  const now = Date.now();
  
  // If we haven't seen this message before or the throttle interval has passed
  if (!THROTTLED_MESSAGES[key] || now - THROTTLED_MESSAGES[key] > THROTTLE_INTERVAL) {
    THROTTLED_MESSAGES[key] = now;
    
    // Add to seen messages if it contains certain keywords
    if (key.includes('admin') || key.includes('track') || key.includes('user') || 
        key.includes('load') || key.includes('dashboard')) {
      SEEN_MESSAGES.add(key);
    }
    
    return false; // Don't throttle
  }
  
  throttledCount++;
  return true; // Throttle the message
}

/**
 * Ultra-aggressive filtering that only lets through critical errors
 */
function isCriticalMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  const messageString = args.map(arg => 
    typeof arg === 'string' ? arg : 
    (arg && typeof arg.toString === 'function') ? arg.toString() : 
    JSON.stringify(arg)
  ).join(' ');
  
  // Only let through actual errors and critical issues
  return messageString.includes('critical') || 
         messageString.includes('fatal') ||
         messageString.includes('crash') ||
         messageString.includes('FATAL');
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
  SEEN_MESSAGES.clear();
  
  // Override console methods to filter out noisy logs
  console.log = function(...args: any[]) {
    // Ultra-aggressive filtering - suppress almost everything
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
    // Always suppress debug logs - they're too noisy
    return;
  };
  
  // Only let through critical errors
  console.error = function(...args: any[]) {
    if (shouldSuppressMessage(args) && !isCriticalMessage(args)) return;
    originalConsole.error(...args);
  };
  
  // Log once that the filter is active - useful for debugging
  originalConsole.log('[Console Filter] Initialized and active with ultra-aggressive filtering');
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
}
