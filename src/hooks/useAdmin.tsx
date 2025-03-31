
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
import { trackAsyncOperation } from '@/utils/performanceMonitor';

export const useAdmin = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bots, setBots] = useState<Bot[]>([]);
  
  // Initialize all admin hooks
  const { isAdmin, adminLogout, changeAdminPassword } = useAdminAuth();
  const { adminActions, loadAdminActions } = useAdminActions();
  const botsManager = useAdminBots();
  const usersManager = useAdminUsers();
  const reportsManager = useAdminReports();
  const { saveSiteSettings, getSiteSettings } = useAdminSettings();
  
  // Combine processing states
  const isProcessing = false; // Simplified as the hooks no longer expose this
  
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
        
        // Initialize the admin service first
        await trackAsyncOperation('initializeAdminService', async () => {
          await adminService.initializeAdminService();
        });
        
        // Create a queue of loading tasks
        const loadingTasks = [
          {
            name: 'bots',
            loadFn: async () => {
              console.log('Loading bots data...');
              await botsManager.loadBots();
            }
          },
          {
            name: 'bannedUsers',
            loadFn: async () => {
              console.log('Loading banned users data...');
              await usersManager.loadBannedUsers();
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
              await reportsManager.loadReports();
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
    
    return () => {
      isMounted = false;
    };
  }, [isAdmin, toast, botsManager, usersManager, loadAdminActions, reportsManager]);
  
  return {
    // State
    isAdmin,
    loading,
    isProcessing,
    bots: botsManager.bots,
    vipUsers,
    standardUsers,
    bannedUsers: usersManager.bannedUsers,
    adminActions,
    reports: reportsManager.reports,
    
    // Bot management
    createBot: botsManager.createBot,
    updateBot: botsManager.updateBot,
    deleteBot: botsManager.deleteBot,
    
    // User actions
    banUser: usersManager.banUser,
    unbanUser: usersManager.unbanUser,
    deleteUser: usersManager.deleteUser,
    
    // Reports
    updateReportStatus: reportsManager.updateReportStatus,
    deleteReport: reportsManager.deleteReport,
    
    // Admin settings
    changeAdminPassword,
    adminLogout,
    
    // Site settings
    saveSiteSettings,
    getSiteSettings,
  };
};
