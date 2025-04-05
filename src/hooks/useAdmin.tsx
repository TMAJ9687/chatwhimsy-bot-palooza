
import { useState, useEffect, useCallback } from 'react';
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
  // Modified to prevent memory leaks with a seen users set
  const seenUsers = new Set<string>();
  
  useEffect(() => {
    if (!isAdmin) return;
    
    // Use a throttled approach to prevent excessive updates
    const updateBatch = () => {
      // Create a batch of users to update
      const batchToUpdate: string[] = [];
      
      // When chat users change, update their status in admin tracking
      chatUsers.forEach(user => {
        if (!seenUsers.has(user.id)) {
          seenUsers.add(user.id);
          batchToUpdate.push(user.id);
        }
      });
      
      // Only update in small batches to prevent performance issues
      if (batchToUpdate.length > 0) {
        console.log(`Updating status for ${batchToUpdate.length} users`);
        
        // Process in smaller batches with delay between
        const processBatch = (index: number) => {
          if (index >= batchToUpdate.length) return;
          
          const userId = batchToUpdate[index];
          trackUserOnlineStatus(userId, true);
          
          // Schedule next batch with setTimeout to prevent UI freezing
          setTimeout(() => processBatch(index + 1), 50);
        };
        
        // Start the batch processing
        processBatch(0);
      }
    };
    
    // Run once on mount
    updateBatch();
    
  }, [isAdmin, trackUserOnlineStatus]);
  
  // Add cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      if (isAdmin) {
        console.log("Admin component unmounting - cleaning up user tracking");
        // Clean up all user tracking to prevent memory leaks
        adminService.cleanupUserTracking();
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
