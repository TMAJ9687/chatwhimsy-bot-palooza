
import { useCallback } from 'react';
import { Bot } from '@/types/chat';
import { AdminAction } from '@/types/admin';

/**
 * Custom hook for loading dashboard data
 */
export const useDashboardLoader = (
  isAdmin: boolean,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>,
  loadBots: () => Promise<Bot[]>,
  loadBannedUsers: () => Promise<any[]>,
  loadAdminActions: () => Promise<AdminAction[]>,
  loadReportsAndFeedback: () => Promise<any[]>,
  cleanupExpiredReports: () => Promise<boolean>
) => {
  // Combined loader for all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
  
    try {
      console.log('Loading dashboard data...');
      
      // Load bots first
      const loadedBots = await loadBots();
      setBots(loadedBots);
      
      // Load other data in parallel
      await Promise.all([
        loadBannedUsers(),
        loadAdminActions().then(actions => setAdminActions(actions)),
        loadReportsAndFeedback(),
        cleanupExpiredReports()
      ]);
      
      console.log('Dashboard data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return false;
    }
  }, [
    isAdmin, 
    setBots, 
    setAdminActions, 
    loadBots, 
    loadBannedUsers, 
    loadAdminActions, 
    loadReportsAndFeedback,
    cleanupExpiredReports
  ]);
  
  return {
    loadDashboardData
  };
};
