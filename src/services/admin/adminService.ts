
import * as firebaseAuth from '@/firebase/auth';
import * as botManagement from './botManagement';
import * as banManagement from './banManagement';
import * as reportService from './reportService';
import * as adminAction from './adminAction';
import * as userManagement from './userManagement';
import * as firestoreService from '@/firebase/firestore';
import AdminAuthService from './adminAuthService';

// Re-export all admin service functions
export const {
  getAllBots,
  getBot,
  createBot,
  updateBot,
  deleteBot
} = botManagement;

export const {
  getBannedUsers,
  banUser,
  unbanUser,
  isUserBanned
} = banManagement;

export const {
  getAdminActions,
  logAdminAction
} = adminAction;

export const {
  getReportsAndFeedback,
  addReportOrFeedback,
  resolveReportOrFeedback,
  deleteReportOrFeedback,
  cleanupExpiredReportsFeedback
} = reportService;

export const {
  kickUser,
  upgradeToVIP,
  downgradeToStandard
} = userManagement;

/**
 * Initialize admin service - ensures all required data is loaded
 */
export const initializeAdminService = async (): Promise<void> => {
  await firestoreService.initializeFirestoreData();
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
