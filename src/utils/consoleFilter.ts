
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
  'reflow from',
  // Add new patterns for unrecognized features and preload warnings
  'Unrecognized feature:',
  'was preloaded using link preload but not used',
  'ambient-light-sensor',
  'battery',
  'vr',
  'unsuccessful attempt to use',
  'Permission',
  'The resource http',
  'The resource https',
  // Admin login specific patterns
  'Attempting admin login',
  'Admin login successful',
  'Using cached admin',
  'Admin email found',
  'checking admin status',
  'admin data',
];

// Admin specific patterns to filter more aggressively
const ADMIN_LOGIN_PATTERNS = [
  'admin',
  'login',
  'auth',
  'session',
  'token',
  'credential',
  'password',
  'supabase',
  'redirect',
  'navigation',
  'dashboard',
  'authenticat',
  'cache',
];

// Limit logging during admin login attempts
let inAdminLoginContext = false;
let adminLoginTimeout: number | null = null;

// Throttle setup
const THROTTLED_MESSAGES: Record<string, number> = {};
const THROTTLE_INTERVAL = 5000; // 5 seconds
const SEEN_MESSAGES = new Set<string>();
const LOGIN_TIMEOUT = 15000; // 15 seconds
const MESSAGE_LIFETIME = 300000; // 5 minutes

// Tracking for init status
let isInitialized = false;
let lastCleanup = Date.now();

/**
 * Periodically cleanup seen messages to prevent memory leaks
 */
function cleanupSeenMessages() {
  const now = Date.now();
  if (now - lastCleanup > MESSAGE_LIFETIME) {
    SEEN_MESSAGES.clear();
    lastCleanup = now;
  }
}

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
  
  // Check if it matches admin login context
  if (messageString.toLowerCase().includes('admin login')) {
    inAdminLoginContext = true;
    
    // Reset admin login context after a timeout
    if (adminLoginTimeout) clearTimeout(adminLoginTimeout);
    adminLoginTimeout = window.setTimeout(() => {
      inAdminLoginContext = false;
      adminLoginTimeout = null;
    }, LOGIN_TIMEOUT);
  }
  
  // More aggressive filtering during admin login
  if (inAdminLoginContext) {
    // Filter all common login-related messages
    return ADMIN_LOGIN_PATTERNS.some(pattern => 
      messageString.toLowerCase().includes(pattern.toLowerCase())
    );
  }
  
  // Normal filtering for non-login contexts
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
  
  // Cleanup old messages occasionally
  cleanupSeenMessages();
  
  if (!THROTTLED_MESSAGES[key] || now - THROTTLED_MESSAGES[key] > THROTTLE_INTERVAL) {
    THROTTLED_MESSAGES[key] = now;
    
    // Add to seen messages after a few occurrences
    const pattern = key.toLowerCase();
    if (pattern.includes('admin') || pattern.includes('facebook') || pattern.includes('feature:') || 
        pattern.includes('preload') || pattern.includes('tracking')) {
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
    
    // Special handling for feature warnings
    if (args.length > 0 && typeof args[0] === 'string') {
      const message = args[0].toLowerCase();
      if (message.includes('unrecognized feature') || message.includes('preload')) {
        return;
      }
    }
    
    if (shouldThrottleMessage(args)) return;
    originalConsole.warn(...args);
  };
  
  console.error = function(...args: any[]) {
    // Special case for Facebook and admin errors - filter them out completely
    if (args.length > 0 && typeof args[0] === 'string' && 
        (args[0].includes('facebook') || args[0].includes('fb-') || 
         args[0].includes('unrecognized feature'))) {
      return;
    }
    
    // More strict filtering for admin login related errors
    if (inAdminLoginContext && args.length > 0 && typeof args[0] === 'string') {
      const message = args[0].toLowerCase();
      if (ADMIN_LOGIN_PATTERNS.some(pattern => message.includes(pattern.toLowerCase()))) {
        return;
      }
    }
    
    if (shouldThrottleMessage(args)) return;
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
  
  // Clear all state
  SEEN_MESSAGES.clear();
  Object.keys(THROTTLED_MESSAGES).forEach(key => {
    delete THROTTLED_MESSAGES[key];
  });
  
  if (adminLoginTimeout) {
    clearTimeout(adminLoginTimeout);
    adminLoginTimeout = null;
  }
  
  inAdminLoginContext = false;
  isInitialized = false;
}

/**
 * Clean up admin-specific tracking data
 */
export function cleanupAdminTracking() {
  inAdminLoginContext = false;
  if (adminLoginTimeout) {
    clearTimeout(adminLoginTimeout);
    adminLoginTimeout = null;
  }
}

// Auto-initialize in non-development environments
if (process.env.NODE_ENV !== 'development') {
  initConsoleFilter();
}
