
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { debouncedAdminAction } from '@/utils/adminUtils';
import { supabase } from '@/integrations/supabase/client';
import { adminLogout } from '@/services/admin/supabaseAdminAuth';

// Import all specialized admin hooks
import { useAdminAuth } from './admin/useAdminAuth';
import { useAdminBots } from './admin/useAdminBots';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminReports } from './admin/useAdminReports';
import { useAdminSettings } from './admin/useAdminSettings';
import { useAdminActions } from './admin/useAdminActions';
import { trackAsyncOperation } from '@/utils/performanceMonitor';

export const useAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  
  // Initialize all admin hooks
  const { isAdmin, adminLogout: authLogout, changeAdminPassword, loading: authLoading } = useAdminAuth();
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
  const isProcessing = isBotsProcessing || isUsersProcessing || authLoading;
  
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  
  // Load data optimized with requestAnimationFrame and chunking
  useEffect(() => {
    if (!isAdmin) return;
    
    let isMounted = true;
    
    const loadAdminData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('Starting admin data load...');
        console.time('adminDataLoad');
        
        // Create a queue of loading tasks
        const loadingTasks = [
          {
            name: 'bots',
            loadFn: async () => {
              console.log('Loading bots data...');
              const loadedBots = await loadBots();
              if (isMounted) {
                setBots(loadedBots || []);
              }
            }
          },
          {
            name: 'bannedUsers',
            loadFn: async () => {
              console.log('Loading banned users data...');
              await loadBannedUsers();
            }
          },
          {
            name: 'adminActions',
            loadFn: async () => {
              console.log('Loading admin actions data...');
              await loadAdminActions();
            }
          },
          {
            name: 'reportsFeedback',
            loadFn: async () => {
              console.log('Loading reports & feedback data...');
              await loadReportsAndFeedback();
            }
          }
        ];
        
        // Process loading tasks in parallel with limits
        await Promise.all(
          loadingTasks.map(task => 
            trackAsyncOperation(`load_${task.name}`, task.loadFn)
          )
        );
        
        if (isMounted) {
          setLoading(false);
          console.timeEnd('adminDataLoad');
          console.log('Admin data loading complete!');
        }
      } catch (error) {
        console.error('Error loading admin data:', error);
        if (isMounted) {
          toast({
            title: 'Error',
            description: 'Failed to load admin data',
            variant: 'destructive',
          });
          setLoading(false);
        }
      }
    };
    
    // Use requestAnimationFrame to avoid blocking the main thread
    requestAnimationFrame(() => {
      loadAdminData();
    });
    
    // Set up interval to periodically clean up expired reports/feedback
    const cleanupInterval = setInterval(async () => {
      if (isAdmin && isMounted) {
        await cleanupExpiredReports();
      }
    }, 60000); // Check every minute
    
    return () => {
      isMounted = false;
      clearInterval(cleanupInterval);
    };
  }, [isAdmin, toast, loadBots, loadBannedUsers, loadAdminActions, loadReportsAndFeedback, cleanupExpiredReports]);

  // Create a wrapped adminLogout function that combines both auth methods
  const combinedAdminLogout = useCallback(async () => {
    try {
      // First try the specialized admin logout
      if (authLogout) {
        const success = await authLogout();
        if (success) return true;
      }
      
      // Fallback to the imported admin logout
      await adminLogout();
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
      return false;
    }
  }, [authLogout, toast]);
  
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
    adminLogout: combinedAdminLogout,
    
    // Site settings
    saveSiteSettings,
    getSiteSettings,
  };
};
