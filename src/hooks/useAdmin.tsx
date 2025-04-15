
import { useAdminContext } from '@/context/AdminContext';
import { useAdminBots } from './admin/useAdminBotsNew';
import { useAdminUsers } from './admin/useAdminUsersNew';
import { useAdminReports } from './admin/useAdminReportsNew';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminDashboard } from './admin/useAdminDashboardNew';

/**
 * Main admin hook for the admin dashboard
 * Uses the AdminContext for state management and composition pattern with specialized hooks
 */
export const useAdmin = () => {
  // Get core admin state from context
  const {
    isAdmin,
    loading,
    isProcessing: isProcessingAuth,
    bots,
    onlineUsers,
    adminActions,
    bannedUsers,
    reportsFeedback,
    adminLogout,
    changeAdminPassword
  } = useAdminContext();
  
  // Bot management functionality
  const { 
    loadBots, 
    createBot, 
    updateBot, 
    deleteBot, 
    trackUserOnlineStatus,
    isProcessing: isBotsProcessing
  } = useAdminBots();
  
  // User management functionality
  const { 
    loadBannedUsers, 
    kickUser, 
    banUser, 
    unbanUser, 
    upgradeToVIP, 
    downgradeToStandard,
    isProcessing: isUsersProcessing
  } = useAdminUsers();
  
  // Reports management functionality
  const { 
    loadReportsAndFeedback, 
    addReport, 
    addFeedback, 
    resolveReportFeedback, 
    deleteReportFeedback 
  } = useAdminReports();
  
  // Settings management functionality
  const { saveSiteSettings, getSiteSettings } = useAdminSettings(isAdmin);
  
  // Dashboard data loading functionality
  const { loadDashboardData } = useAdminDashboard();
  
  // Combine processing states
  const isProcessing = isBotsProcessing || isUsersProcessing || isProcessingAuth;
  
  return {
    // State
    isAdmin,
    loading,
    isProcessing,
    bots,
    onlineUsers,
    bannedUsers,
    adminActions,
    reportsFeedback,
    
    // Bot management
    loadBots,
    createBot,
    updateBot,
    deleteBot,
    trackUserOnlineStatus,
    
    // User actions
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    loadBannedUsers,
    
    // Reports and Feedback
    addReport,
    addFeedback,
    resolveReportFeedback,
    deleteReportFeedback,
    loadReportsAndFeedback,
    
    // Admin settings
    changeAdminPassword,
    adminLogout,
    saveSiteSettings,
    getSiteSettings,
    
    // Data loading
    loadDashboardData,
  };
};

// Export the AdminContext hook for direct usage
export { useAdminContext } from '@/context/AdminContext';
