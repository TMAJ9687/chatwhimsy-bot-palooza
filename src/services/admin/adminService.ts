
import { isAdminLoggedIn as checkAdminStatus } from './supabaseAdminAuth';

// Export the cleanup function 
export { cleanupUserTracking } from './userService';

// Re-export functions from other service files
export * from './userService';
export * from './vipAdminService';
export * from './reportAdminService';
export * from './adminActionService';
export * from './botService';

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = checkAdminStatus;
