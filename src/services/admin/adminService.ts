
import * as firebaseAuth from '@/firebase/auth';
import * as supabaseAdmin from '@/lib/supabase/supabaseAdmin';
import AdminAuthService from './adminAuthService';

// Re-export all admin service functions
export const {
  getAllBots,
  getBot,
  createBot,
  updateBot,
  deleteBot
} = supabaseAdmin;

export const {
  getBannedUsers,
  banUser,
  unbanUser,
  isUserBanned
} = supabaseAdmin;

export const {
  getAdminActions,
  logAdminAction
} = supabaseAdmin;

export const {
  getReportsAndFeedback,
  addReportOrFeedback,
  resolveReportOrFeedback,
  deleteReportOrFeedback,
  cleanupExpiredReportsFeedback
} = supabaseAdmin;

export const {
  kickUser,
  upgradeToVIP,
  downgradeToStandard
} = supabaseAdmin;

/**
 * Initialize admin service - ensures all required data is loaded
 */
export const initializeAdminService = async (): Promise<void> => {
  await supabaseAdmin.initializeSupabaseAdminData();
};

/**
 * Set admin login status - uses secure AdminAuthService
 */
export const setAdminLoggedIn = (isLoggedIn: boolean): void => {
  // This function is now a wrapper around AdminAuthService for backward compatibility
  console.log('Using AdminAuthService to set admin logged in state:', isLoggedIn);
  
  // No-op - this is handled directly by AdminAuthService during login/logout
};

/**
 * Verify if admin is currently logged in
 */
export const isAdminLoggedIn = (): boolean => {
  // Use the new AdminAuthService for checking admin login status
  return AdminAuthService.isAdminSession();
};

/**
 * Logout admin user securely
 */
export const adminLogout = async (): Promise<void> => {
  // Use the new AdminAuthService for admin logout
  await AdminAuthService.adminLogout();
};

/**
 * Verify admin credentials
 */
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  return await AdminAuthService.verifyAdminCredentials(email, password);
};
