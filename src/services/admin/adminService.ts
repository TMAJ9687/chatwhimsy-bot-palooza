
import { isAdminLoggedIn as checkAdminStatus } from './supabaseAdminAuth';

// Export the cleanup function 
export { cleanupUserTracking } from './userService';

// Re-export functions from other service files, avoiding duplicate exports
export * from './userService';
export * from './reportAdminService';
export * from './adminActionService';
export * from './botService';

// Global tracking flag to prevent duplicate initialization and disable tracking
let adminTrackingInitialized = false;
const trackedUsers = new Set<string>();

// Set this to false to enable admin tracking
const DISABLE_ADMIN_TRACKING = false;

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = checkAdminStatus;

/**
 * Initialize admin tracking only once
 */
export const initAdminTracking = (): boolean => {
  // If tracking is disabled, always return false
  if (DISABLE_ADMIN_TRACKING) return false;
  
  if (adminTrackingInitialized) {
    return false;
  }
  adminTrackingInitialized = true;
  return true;
};

/**
 * Check if admin tracking is already initialized
 */
export const isAdminTrackingInitialized = (): boolean => {
  // If tracking is disabled, always return false
  if (DISABLE_ADMIN_TRACKING) return false;
  return adminTrackingInitialized;
};

/**
 * Track user activity with deduplication
 * @param userId The user ID to track
 * @param isBot Whether the user is a bot
 */
export const trackUserActivity = (userId: string, isBot: boolean = false): boolean => {
  // If tracking is disabled, always return false
  if (DISABLE_ADMIN_TRACKING) return false;
  
  // Skip if already tracking this user
  if (trackedUsers.has(userId)) {
    return false;
  }
  
  // Add to tracked set
  trackedUsers.add(userId);
  return true;
};

/**
 * Check if a user is already being tracked
 */
export const isUserTracked = (userId: string): boolean => {
  // If tracking is disabled, always return false
  if (DISABLE_ADMIN_TRACKING) return false;
  return trackedUsers.has(userId);
};

/**
 * Clean up tracked user
 */
export const untrackUser = (userId: string): boolean => {
  if (trackedUsers.has(userId)) {
    trackedUsers.delete(userId);
    return true;
  }
  return false;
};

/**
 * Reset all tracked users
 */
export const resetTrackedUsers = (): number => {
  const count = trackedUsers.size;
  trackedUsers.clear();
  return count;
};
