
import { isAdminLoggedIn as checkAdminStatus } from './supabaseAdminAuth';

// Re-export functions from other service files
export * from './userAdminService';
export * from './vipAdminService';
export * from './reportAdminService';
export * from './adminActionService';
export * from './botService';

/**
 * Check if admin is logged in
 */
export const isAdminLoggedIn = checkAdminStatus;
