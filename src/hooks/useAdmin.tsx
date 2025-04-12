import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminCore } from './admin/useAdminCore';
import { useAdminBots } from './admin/useAdminBots';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminReports } from './admin/useAdminReports';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminActions } from './admin/useAdminActions';
import { useAdminLogout } from './admin/useAdminLogout';
import { useAdminDashboardData } from './admin/useAdminDashboardData';
import { Bot } from '@/types/chat';
import * as adminService from '@/services/admin/adminService';

/**
 * Main admin hook for the admin dashboard
 * Composed from smaller, focused hooks
 */
export const useAdmin = () => {
  // Core admin state and authentication
  const {
    bots,
    setBots,
    adminActions,
    setAdminActions,
    loading,
    setLoading,
    onlineUsers,
    setOnlineUsers,
    isAdmin,
    currentUser,
    isProcessingAuth,
    authLogout,
    changeAdminPassword
  } = useAdminCore();
  
  // Tracking references
  const processedUsersRef = useRef(new Set<string>());
  const isProcessingRef = useRef(false);
  const lastTrackingUpdateRef = useRef(0);
  
  // Initialize admin hooks
  const { loadAdminActions } = useAdminActions(isAdmin, setAdminActions);
  
  // Bot management functionality
  const { 
    loadBots, 
    createBot, 
    updateBot, 
    deleteBot, 
    trackUserOnlineStatus,
    isProcessing: isBotsProcessing 
  } = useAdminBots(isAdmin);
  
  // User management functionality
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
  
  // Reports management functionality
  const { 
    reportsFeedback, 
    loadReportsAndFeedback, 
    cleanupExpiredReports,
    addReport, 
    addFeedback, 
    resolveReportFeedback, 
    deleteReportFeedback 
  } = useAdminReports(isAdmin);
  
  // Settings management functionality
  const { saveSiteSettings, getSiteSettings } = useAdminSettings(isAdmin);
  
  // Wrap cleanup reports for consistent return type
  const wrappedCleanupReports = useCallback(async (): Promise<boolean> => {
    try {
      await cleanupExpiredReports();
      return true;
    } catch (error) {
      return false;
    }
  }, [cleanupExpiredReports]);
  
  // Dashboard data loading with object configuration
  const { loadDashboardData } = useAdminDashboardData({
    isAdmin,
    setBots,
    setAdminActions,
    setLoading,
    loadBots,
    loadBannedUsers,
    loadAdminActions,
    loadReportsAndFeedback,
    cleanupExpiredReports: wrappedCleanupReports
  });
  
  // Admin logout functionality
  const { adminLogout } = useAdminLogout(authLogout);
  
  // Combine processing states
  const isProcessing = isBotsProcessing || isUsersProcessing || isProcessingAuth;
  
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
