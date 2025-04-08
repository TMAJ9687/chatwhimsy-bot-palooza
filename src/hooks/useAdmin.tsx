
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

// Use a constant flag to completely disable user tracking
const DISABLE_USER_TRACKING = true;

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
  const wrappedCleanupReports = useCallback(async (): Promise<boolean> => {
    try {
      await cleanupExpiredReports();
      return true;
    } catch (error) {
      return false;
    }
  }, [cleanupExpiredReports]);
  
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
  
  // Completely disable user tracking or throttle extremely aggressively
  useEffect(() => {
    if (DISABLE_USER_TRACKING || !isAdmin || isProcessingRef.current) return;
    
    // Extremely throttle updates to once per 30 seconds maximum
    const now = Date.now();
    if (now - lastTrackingUpdateRef.current < 30000) {
      return;
    }
    
    // Set processing flag to prevent concurrent processing
    isProcessingRef.current = true;
    lastTrackingUpdateRef.current = now;
    
    // Process only one user at a time maximum
    const chatUserIds = chatUsers.map(user => user.id);
    const newUsers = chatUserIds.filter(id => !processedUsersRef.current.has(id));
    
    if (newUsers.length > 0) {
      // Just track one user at a time
      const userToTrack = newUsers[0];
      trackUserOnlineStatus(userToTrack, true);
      processedUsersRef.current.add(userToTrack);
    }
    
    // Always ensure processing flag is reset
    setTimeout(() => {
      isProcessingRef.current = false;
    }, 1000);
    
  }, [isAdmin, trackUserOnlineStatus, chatUsers]);
  
  // Clean up all tracking
  useEffect(() => {
    return () => {
      if (isAdmin) {
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
