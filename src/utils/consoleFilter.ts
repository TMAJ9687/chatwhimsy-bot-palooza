
/**
 * Console Filter Utility
 * Reduces noise in the console by filtering out unnecessary messages
 * and throttling repeated messages.
 */

// Store original console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
  info: console.info,
  debug: console.debug
};

// Patterns to filter out completely
const FILTERED_PATTERNS = [
  'facebook',
  'fb-',
  'fb:',
  'fbq',
  'fbevents',
  'preload',
  '[Facebook]',
  'user tracking',
  'already tracked',
  '[Tracking]',
  'admin session',
  'setting up admin',
  'cleaning up',
  'loading dashboard',
  'react-dom.development.js',
  'violation',
  'Preconnect',
  'Received `true` for a non-boolean attribute',
  'Failed to load resource',
  'reflow from'
];

// Throttle setup
const THROTTLED_MESSAGES: Record<string, number> = {};
const THROTTLE_INTERVAL = 5000; // 5 seconds
const SEEN_MESSAGES = new Set<string>();

// Tracking for init status
let isInitialized = false;

/**
 * Check if a message should be filtered
 */
function shouldFilterMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  // Convert args to string for pattern matching
  const messageString = args.map(arg => 
    typeof arg === 'string' ? arg : 
    (arg && typeof arg === 'object') ? JSON.stringify(arg) : 
    String(arg)
  ).join(' ');
  
  return FILTERED_PATTERNS.some(pattern => 
    messageString.toLowerCase().includes(pattern.toLowerCase())
  );
}

/**
 * Check if a message should be throttled
 */
function shouldThrottleMessage(args: any[]): boolean {
  if (args.length === 0) return false;
  
  const key = args.map(arg => 
    typeof arg === 'string' ? arg : 
    (arg && typeof arg === 'object') ? JSON.stringify(arg) : 
    String(arg)
  ).join('|').substring(0, 100); // Limit key length
  
  if (SEEN_MESSAGES.has(key)) {
    return true;
  }
    
  const now = Date.now();
  
  if (!THROTTLED_MESSAGES[key] || now - THROTTLED_MESSAGES[key] > THROTTLE_INTERVAL) {
    THROTTLED_MESSAGES[key] = now;
    
    // Add to seen messages after a few occurrences
    const pattern = key.toLowerCase();
    if (pattern.includes('admin') || pattern.includes('facebook')) {
      SEEN_MESSAGES.add(key);
    }
    
    return false;
  }
  
  return true;
}

/**
 * Initialize console filter
 */
export function initConsoleFilter() {
  if (isInitialized) return;
  isInitialized = true;
  
  // Override console methods
  console.log = function(...args: any[]) {
    if (shouldFilterMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.log(...args);
  };
  
  console.info = function(...args: any[]) {
    if (shouldFilterMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.info(...args);
  };
  
  console.warn = function(...args: any[]) {
    if (shouldFilterMessage(args)) return;
    originalConsole.warn(...args);
  };
  
  console.error = function(...args: any[]) {
    // Special case for Facebook errors - filter them out completely
    if (args.length > 0 && typeof args[0] === 'string' && 
        (args[0].includes('facebook') || args[0].includes('fb-'))) {
      return;
    }
    originalConsole.error(...args);
  };
  
  console.debug = function(...args: any[]) {
    // Always suppress debug logs in production
    if (process.env.NODE_ENV !== 'development') return;
    if (shouldFilterMessage(args) || shouldThrottleMessage(args)) return;
    originalConsole.debug(...args);
  };
}

/**
 * Restore original console behavior
 */
export function restoreConsole() {
  if (!isInitialized) return;
  
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
  console.info = originalConsole.info;
  console.debug = originalConsole.debug;
  
  isInitialized = false;
}
