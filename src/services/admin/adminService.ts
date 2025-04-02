
import * as firebaseAuth from '@/firebase/auth';
import * as botManagement from './botManagement';
import * as banManagement from './banManagement';
import * as reportService from './reportService';
import * as adminAction from './adminAction';
import * as userManagement from './userManagement';
import * as firestoreService from '@/firebase/firestore';

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
 * Set admin login status in local storage
 */
export const setAdminLoggedIn = (isLoggedIn: boolean): void => {
  console.log('Setting admin logged in state:', isLoggedIn);
  
  // Store admin authentication state
  if (isLoggedIn) {
    localStorage.setItem('adminData', JSON.stringify({ authenticated: true }));
  } else {
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminEmail');
  }
};

/**
 * Verify if admin is currently logged in
 * This is optimized to prevent redirect loops
 */
export const isAdminLoggedIn = (): boolean => {
  console.log('Checking if admin is logged in');
  
  // Don't check logged in state on login page to prevent redirect loops
  if (window.location.pathname === '/secretadminportal') {
    console.log('On admin login page, returning false to prevent redirect loop');
    return false;
  }
  
  // Check Firebase auth state first
  const user = firebaseAuth.getCurrentUser();
  if (user && firebaseAuth.isUserAdmin(user)) {
    console.log('Admin is logged in via Firebase auth', user.email);
    return true;
  }
  
  // Fall back to localStorage for backward compatibility
  const adminData = localStorage.getItem('adminData');
  
  if (adminData) {
    try {
      const data = JSON.parse(adminData);
      const isAuthenticated = data.authenticated === true;
      console.log('Admin authentication from localStorage:', isAuthenticated);
      return isAuthenticated;
    } catch (e) {
      console.error('Error parsing admin data from localStorage', e);
      localStorage.removeItem('adminData');
      return false;
    }
  }
  
  console.log('No admin session found');
  return false;
};

/**
 * Logout admin user
 */
export const adminLogout = async (): Promise<void> => {
  // Clear admin session from localStorage first for immediate effect
  localStorage.removeItem('adminData');
  localStorage.removeItem('adminEmail');
  
  // Sign out from Firebase
  await firebaseAuth.signOutUser();
};

/**
 * Verify admin credentials
 */
export const verifyAdminCredentials = async (email: string, password: string): Promise<boolean> => {
  return await firebaseAuth.verifyAdminCredentials(email, password);
};

