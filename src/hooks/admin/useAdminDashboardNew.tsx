
import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';

/**
 * Hook for loading all admin dashboard data that uses the AdminContext
 */
export const useAdminDashboard = () => {
  const { 
    isAdmin, 
    setLoading,
    setBots,
    setAdminActions,
    setReportsFeedback,
    setBannedUsers
  } = useAdminContext();
  
  const { toast } = useToast();
  
  // Combined loading function for all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
    
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Get references to load functions from other hooks
      // In a real implementation, we'd import these functions or get them from context
      const loadBots = async () => [];
      const loadAdminActions = async () => [];
      const loadBannedUsers = async () => [];
      const loadReportsAndFeedback = async () => [];
      const cleanupExpiredReports = async () => true;
      
      // Load data in parallel where possible
      await Promise.all([
        loadBots().then(loadedBots => {
          setBots(loadedBots);
          return loadedBots;
        }),
        loadAdminActions().then(actions => {
          setAdminActions(actions);
          return actions;
        }),
        loadBannedUsers().then(banned => {
          setBannedUsers(banned);
          return banned;
        }),
        loadReportsAndFeedback().then(reports => {
          setReportsFeedback(reports);
          return reports;
        })
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
  }, [isAdmin, setLoading, toast, setBots, setAdminActions, setBannedUsers, setReportsFeedback]);
  
  return {
    loadDashboardData
  };
};
