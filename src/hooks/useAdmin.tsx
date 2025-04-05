
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useChatInitialization } from './useChatInitialization';
import { useAdminAuth } from './admin/useAdminAuth';
import { useAdminBots } from './admin/useAdminBots';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminReports } from './admin/useAdminReports';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminActions } from './admin/useAdminActions';
import { useAdminLogout } from './admin/useAdminLogout';
import { useAdminStatsHook } from './admin/useAdminStatsHook';
import { useDashboardLoader } from './admin/useDashboardLoader';
import { Bot } from '@/types/chat';

export const useAdmin = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { onlineUsers: chatUsers } = useChatInitialization();
  
  // Initialize all admin hooks
  const { isAdmin, adminLogout: authLogout, changeAdminPassword, loading: authLoading, adminData } = useAdminAuth();
  const { adminActions, setAdminActions, loadAdminActions } = useAdminActions(isAdmin);
  const { 
    loadBots, 
    createBot, 
    updateBot, 
    deleteBot, 
    onlineUsers,
    trackUserOnlineStatus,
    isProcessing: isBotsProcessing 
  } = useAdminBots(isAdmin);

  // Pass current user from authentication data
  const currentUser = adminData;
  
  // Initialize users management with both standard user management and VIP methods
  const { 
    bannedUsers, 
    loadBannedUsers, 
    kickUser, 
    banUser, 
    unbanUser, 
    upgradeToVIP, 
    downgradeToStandard, 
    isProcessing: isUsersProcessing 
  } = useAdminUsers(isAdmin, bots, setBots, setAdminActions, currentUser);
  
  const { 
    reportsFeedback, 
    loadReportsAndFeedback, 
    cleanupExpiredReports,
    addReport, 
    addFeedback, 
    resolveReportFeedback, 
    deleteReportFeedback 
  } = useAdminReports(isAdmin);
  
  const { saveSiteSettings, getSiteSettings } = useAdminSettings(isAdmin);
  
  // Fix: Update the cleanupExpiredReports function to return a boolean
  const wrappedCleanupReports = async (): Promise<boolean> => {
    try {
      await cleanupExpiredReports();
      return true;
    } catch (error) {
      console.error('Error cleaning up reports:', error);
      return false;
    }
  };
  
  // Initialize the dashboard loader with the fixed cleanupExpiredReports function
  const { loadDashboardData } = useDashboardLoader(
    isAdmin,
    setBots,
    setAdminActions,
    loadBots,
    loadBannedUsers,
    loadAdminActions,
    loadReportsAndFeedback,
    wrappedCleanupReports
  );
  
  // Initialize the admin logout functionality
  const { adminLogout } = useAdminLogout(authLogout);
  
  // Get calculated stats
  const { vipUsers, standardUsers } = useAdminStatsHook(bots, onlineUsers || []);
  
  // Combine processing states
  const isProcessing = isBotsProcessing || isUsersProcessing || authLoading;

  // Dashboard loading state
  const [loading, setLoading] = useState(true);
  
  // Load dashboard data when admin status changes
  useEffect(() => {
    if (isAdmin) {
      setLoading(true);
      loadDashboardData().finally(() => setLoading(false));
    }
  }, [isAdmin, loadDashboardData]);
  
  // Track chat users to update admin dashboard
  useEffect(() => {
    if (!isAdmin) return;
    
    // When chat users change, update their status in admin tracking
    chatUsers.forEach(user => {
      trackUserOnlineStatus(user.id, true); // Mark all chat users as online
    });
    
  }, [isAdmin, chatUsers, trackUserOnlineStatus]);
  
  return {
    // State
    isAdmin,
    loading,
    isProcessing,
    bots,
    onlineUsers,
    vipUsers,
    standardUsers,
    bannedUsers,
    adminActions,
    reportsFeedback,
    
    // Bot management
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
    
    // Reports and Feedback
    addReport,
    addFeedback,
    resolveReportFeedback,
    deleteReportFeedback,
    
    // Admin settings
    changeAdminPassword,
    adminLogout,
    
    // Site settings
    saveSiteSettings,
    getSiteSettings,
  };
};
