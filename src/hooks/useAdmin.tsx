
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

export const useAdmin = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const { onlineUsers: chatUsers } = useChatInitialization();
  const processedUsersRef = useRef(new Set<string>());
  const isProcessingRef = useRef(false);
  const lastTrackingUpdateRef = useRef(0);
  
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
  
  // Load dashboard data when admin status changes - with proper cleanup
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
  
  // Track chat users to update admin dashboard with aggressive throttling
  useEffect(() => {
    if (!isAdmin || isProcessingRef.current) return;
    
    // Throttle updates to once per 5 seconds maximum
    const now = Date.now();
    if (now - lastTrackingUpdateRef.current < 5000) {
      return;
    }
    
    // Set processing flag to prevent concurrent processing
    isProcessingRef.current = true;
    lastTrackingUpdateRef.current = now;
    
    // Limited batch update for chat users
    const BATCH_SIZE = 5; // Process users in small batches
    const MAX_TRACKED_USERS = 100; // Hard limit on tracked users
    
    // Get new users that haven't been processed yet
    const chatUserIds = chatUsers.map(user => user.id);
    const newUsers = chatUserIds.filter(id => !processedUsersRef.current.has(id));
    
    try {
      if (newUsers.length > 0) {
        // Limited tracking for new users
        const usersToProcess = newUsers.slice(0, BATCH_SIZE);
        
        // Only log when actually tracking new users
        if (usersToProcess.length > 0) {
          console.log(`Tracking ${usersToProcess.length} new users (out of ${newUsers.length} untracked)`);
        }
        
        // Process a small batch at a time
        usersToProcess.forEach(userId => {
          // Check if we haven't exceeded the maximum tracked users
          if (processedUsersRef.current.size < MAX_TRACKED_USERS) {
            trackUserOnlineStatus(userId, true);
            processedUsersRef.current.add(userId);
          }
        });
      }
    } finally {
      // Always ensure we release the processing lock
      isProcessingRef.current = false;
    }
  }, [isAdmin, trackUserOnlineStatus, chatUsers]);
  
  // Add cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (isAdmin) {
        console.log("Admin component unmounting - cleaning up user tracking");
        // Clean up all user tracking to prevent memory leaks
        adminService.cleanupUserTracking();
        
        // Reset our tracking state
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
