
import { useCallback } from 'react';
import { useAdminContext } from '@/context/AdminContext';
import { useAdminBots } from './admin/useAdminBotsNew';
import { useAdminUsers } from './admin/useAdminUsersNew';
import { useAdminReports } from './admin/useAdminReportsNew';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminDashboard } from './admin/useAdminDashboardNew';

/**
 * Main admin hook that uses the AdminContext for state management
 * This is a refactored version of useAdmin with improved organization and better state management
 */
export const useAdminNew = () => {
  // Get core admin state from context
  const {
    isAdmin,
    loading,
    isProcessing,
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
    trackUserOnlineStatus
  } = useAdminBots();
  
  // User management functionality
  const { 
    loadBannedUsers, 
    kickUser, 
    banUser, 
    unbanUser, 
    upgradeToVIP, 
    downgradeToStandard
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
