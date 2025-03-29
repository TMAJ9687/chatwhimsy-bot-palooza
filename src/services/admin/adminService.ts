
import { initializeFirestoreData } from '@/firebase/firestore';
import * as adminAuth from './adminAuth';
import * as botManagement from './botManagement';
import * as userManagement from './userManagement';
import * as banManagement from './banManagement';
import * as reportManagement from './reportService';
import * as actionManagement from './adminAction';

// Initialize the admin service
export const initializeAdminService = async (): Promise<void> => {
  console.time('adminServiceInit');
  
  try {
    // Initialize Firestore with default data if needed
    await initializeFirestoreData();
    console.log('Admin service initialized successfully');
  } catch (error) {
    console.error('Error initializing admin service:', error);
    
    // Fallback to using local data if Firestore access fails
    console.log('Using local fallback data for admin service');
  }
  
  console.timeEnd('adminServiceInit');
};

// Re-export all functionality from the imported modules
export const {
  setAdminLoggedIn,
  isAdminLoggedIn,
  adminLogout,
  verifyAdminCredentials
} = adminAuth;

export const {
  getAllBots,
  getBot,
  createBot,
  updateBot,
  deleteBot
} = botManagement;

export const {
  kickUser,
  upgradeToVIP,
  downgradeToStandard,
  calculateExpiryDate
} = userManagement;

export const {
  getBannedUsers,
  banUser,
  unbanUser,
  isUserBanned
} = banManagement;

export const {
  addReportOrFeedback,
  getReportsAndFeedback,
  resolveReportOrFeedback,
  deleteReportOrFeedback,
  cleanupExpiredReportsFeedback
} = reportManagement;

export const {
  getAdminActions,
  logAdminAction
} = actionManagement;
