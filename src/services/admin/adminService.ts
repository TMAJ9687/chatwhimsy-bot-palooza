
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
