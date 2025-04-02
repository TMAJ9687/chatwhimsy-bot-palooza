
import * as adminAuth from '@/services/admin/supabaseAdminAuth';
import * as botManagement from './botManagement';
import * as banManagement from './banManagement';
import * as reportService from './reportService';
import * as adminAction from './adminAction';
import * as userManagement from './userManagement';
import * as supabaseFirestore from '@/integrations/supabase/client';

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

// Re-export admin auth functions
export const {
  setAdminLoggedIn,
  isAdminLoggedIn,
  adminLogout,
  verifyAdminCredentials
} = adminAuth;

/**
 * Initialize admin service - ensures all required data is loaded
 */
export const initializeAdminService = async (): Promise<void> => {
  // Check connection to Supabase
  try {
    const { data, error } = await supabaseFirestore.supabase.from('admin_users').select('count');
    if (error) {
      console.error('Error connecting to Supabase:', error);
    } else {
      console.log('Successfully connected to Supabase admin service');
    }
  } catch (error) {
    console.error('Failed to initialize admin service:', error);
  }
};
