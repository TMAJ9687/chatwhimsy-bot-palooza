
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
  
  // Function references from other hooks (these would be passed in or available through context)
  // Note: In a full implementation, you might want to pass these functions in or make them available through context
  const loadBots = async () => [];
  const loadBannedUsers = async () => {
    const bannedUsers = [];
    setBannedUsers(bannedUsers);
    return bannedUsers;
  };
  const loadAdminActions = async () => {
    const actions = [];
    setAdminActions(actions);
    return actions;
  };
  const loadReportsAndFeedback = async () => {
    const reports = [];
    setReportsFeedback(reports);
    return reports;
  };
  const cleanupExpiredReports = async () => {};
  
  // Combined loading function for all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
    
    try {
      setLoading(true);
      console.log('Loading dashboard data...');
      
      // Load data in parallel where possible
      await Promise.all([
        loadBots(),
        loadAdminActions(),
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
  }, [isAdmin, setLoading, toast, setAdminActions, setBannedUsers, setReportsFeedback]);
  
  return {
    loadDashboardData
  };
};
