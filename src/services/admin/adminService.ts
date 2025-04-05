
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

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = checkAdminStatus;
