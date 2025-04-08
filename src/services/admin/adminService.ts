
import { isAdminLoggedIn as checkAdminStatus } from './supabaseAdminAuth';

// Export the cleanup function 
export { cleanupUserTracking } from './userService';

// Re-export functions from other service files, avoiding duplicate exports
export * from './userService';
// Only export functions from vipAdminService that aren't already exported from userService
// We're commenting out this export since it causes conflicts
// export * from './vipAdminService';
export * from './reportAdminService';
export * from './adminActionService';
export * from './botService';

// Global tracking flag to prevent duplicate initialization
let adminTrackingInitialized = false;
const trackedUsers = new Set<string>();

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = checkAdminStatus;

/**
 * Initialize admin tracking only once
 */
export const initAdminTracking = (): boolean => {
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
  return adminTrackingInitialized;
};

/**
 * Track user activity with deduplication
 * @param userId The user ID to track
 * @param isBot Whether the user is a bot
 */
export const trackUserActivity = (userId: string, isBot: boolean = false): boolean => {
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
