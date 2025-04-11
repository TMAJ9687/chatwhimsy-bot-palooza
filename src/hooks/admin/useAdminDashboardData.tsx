
import { useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/types/chat';
import { AdminAction } from '@/types/admin';

/**
 * Hook for loading and managing all dashboard data
 */
export const useAdminDashboardData = (
  isAdmin: boolean,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loadBots: () => Promise<Bot[]>,
  loadBannedUsers: () => Promise<any[]>,
  loadAdminActions: () => Promise<AdminAction[]>,
  loadReportsAndFeedback: () => Promise<any[]>,
  cleanupExpiredReports: () => Promise<boolean>
) => {
  const { toast } = useToast();

  // Combined loading function for all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
    
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Load data in parallel where possible
      const [bots, actions, , ] = await Promise.all([
        loadBots().then(loadedBots => {
          setBots(loadedBots);
          return loadedBots;
        }),
        loadAdminActions().then(actions => {
          setAdminActions(actions);
          return actions;
        }),
        loadBannedUsers(),
        loadReportsAndFeedback()
      ]);
      
      // Cleanup expired reports in background
      cleanupExpiredReports().catch(console.error);
      
      setLoading(false);
      console.log('Dashboard data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
      setLoading(false);
      return false;
    }
  }, [isAdmin, loadBots, loadAdminActions, loadBannedUsers, loadReportsAndFeedback, cleanupExpiredReports, setBots, setAdminActions, setLoading, toast]);
  
  // Auto-load dashboard data when admin status changes
  useEffect(() => {
    if (isAdmin) {
      loadDashboardData();
    }
  }, [isAdmin, loadDashboardData]);
  
  return {
    loadDashboardData
  };
};
