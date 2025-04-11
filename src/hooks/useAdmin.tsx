
import { useState, useEffect, useCallback, useRef } from 'react';
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
import * as adminService from '@/services/admin/adminService';

// Disable user tracking to improve performance
const DISABLE_USER_TRACKING = true;

export const useAdmin = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { onlineUsers: chatUsers } = useChatInitialization();
  const processedUsersRef = useRef(new Set<string>());
  const isProcessingRef = useRef(false);
  const lastTrackingUpdateRef = useRef(0);
  
  // Initialize admin hooks
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

  // Current user from authentication data
  const currentUser = adminData;
  
  // Initialize users management
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
  
  // Initialize reports management
  const { 
    reportsFeedback, 
    loadReportsAndFeedback, 
    cleanupExpiredReports,
    addReport, 
    addFeedback, 
    resolveReportFeedback, 
    deleteReportFeedback 
  } = useAdminReports(isAdmin);
  
  // Admin settings
  const { saveSiteSettings, getSiteSettings } = useAdminSettings(isAdmin);
  
  // Fix: Update the cleanupExpiredReports function to return a boolean
  const wrappedCleanupReports = useCallback(async (): Promise<boolean> => {
    try {
      await cleanupExpiredReports();
      return true;
    } catch (error) {
      return false;
    }
  }, [cleanupExpiredReports]);
  
  // Initialize the dashboard loader
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
  
  // Admin logout functionality
  const { adminLogout } = useAdminLogout(authLogout);
  
  // Get calculated stats
  const { vipUsers, standardUsers } = useAdminStatsHook(bots, onlineUsers || []);
  
  // Combine processing states
  const isProcessing = isBotsProcessing || isUsersProcessing || authLoading;

  // Dashboard loading state
  const [loading, setLoading] = useState(true);
  
  // Load dashboard data when admin status changes
  useEffect(() => {
    let isMounted = true;
    
    if (isAdmin) {
      setLoading(true);
      loadDashboardData().finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isAdmin, loadDashboardData]);
  
  // Clean up all tracking when unmounting
  useEffect(() => {
    return () => {
      if (isAdmin) {
        adminService.cleanupUserTracking();
        processedUsersRef.current.clear();
        lastTrackingUpdateRef.current = 0;
      }
    };
  }, [isAdmin]);
  
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
    createBot,  // Explicitly include createBot here
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
    loadReportsAndFeedback,
    
    // Admin settings
    changeAdminPassword,
    adminLogout,
    saveSiteSettings,
    getSiteSettings,
    
    // Data loading
    loadBannedUsers,
    loadDashboardData,
  };
};
