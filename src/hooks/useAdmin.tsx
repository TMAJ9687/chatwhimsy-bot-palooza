
import { useState, useEffect, useMemo } from 'react';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { debouncedAdminAction } from '@/utils/adminUtils';
import * as adminService from '@/services/admin/adminService';

// Import all specialized admin hooks
import { useAdminAuth } from './admin/useAdminAuth';
import { useAdminBots } from './admin/useAdminBots';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminReports } from './admin/useAdminReports';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminActions } from './admin/useAdminActions';

export const useAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  
  // Initialize all admin hooks
  const { isAdmin, adminLogout, changeAdminPassword } = useAdminAuth();
  const { adminActions, setAdminActions, loadAdminActions } = useAdminActions(isAdmin);
  const { loadBots, createBot, updateBot, deleteBot, isProcessing: isBotsProcessing } = useAdminBots(isAdmin);
  const { 
    bannedUsers, 
    loadBannedUsers, 
    kickUser, 
    banUser, 
    unbanUser, 
    upgradeToVIP, 
    downgradeToStandard, 
    isProcessing: isUsersProcessing 
  } = useAdminUsers(isAdmin, bots, setBots, setAdminActions);
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
  
  // Combine processing states
  const isProcessing = isBotsProcessing || isUsersProcessing;
  
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  
  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    
    const loadAdminData = async () => {
      try {
        setLoading(true);
        console.log('Starting admin data load...');
        console.time('adminDataLoad');
        
        // Initialize the admin service
        await adminService.initializeAdminService();
        
        // Load data in batches with setTimeout to avoid blocking UI
        const loadBotsData = async () => {
          console.log('Loading bots data...');
          const loadedBots = await loadBots();
          setBots(loadedBots || []);
          
          setTimeout(loadBannedData, 10);
        };
        
        const loadBannedData = async () => {
          await loadBannedUsers();
          setTimeout(loadActionsData, 10);
        };
        
        const loadActionsData = async () => {
          await loadAdminActions();
          setTimeout(loadReportsData, 10);
        };
        
        const loadReportsData = async () => {
          await loadReportsAndFeedback();
          
          setLoading(false);
          console.timeEnd('adminDataLoad');
          console.log('Admin data loading complete!');
        };
        
        // Start loading sequence
        loadBotsData();
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };
    
    loadAdminData();
    
    // Set up interval to periodically clean up expired reports/feedback
    const cleanupInterval = setInterval(async () => {
      if (isAdmin) {
        await cleanupExpiredReports();
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isAdmin, toast, loadBots, loadBannedUsers, loadAdminActions, loadReportsAndFeedback, cleanupExpiredReports]);
  
  return {
    // State
    isAdmin,
    loading,
    isProcessing,
    bots,
    vipUsers,
    standardUsers,
    bannedUsers,
    adminActions,
    reportsFeedback,
    
    // Bot management
    createBot,
    updateBot,
    deleteBot,
    
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
