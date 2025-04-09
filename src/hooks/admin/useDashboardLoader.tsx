
import { useCallback } from 'react';
import { Bot } from '@/types/chat';
import { AdminAction } from '@/types/admin';

/**
 * Custom hook for loading all dashboard data
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
  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
    
    try {
      console.log('Loading dashboard data...');
      
      // Load in sequence to avoid overloading the server
      await Promise.all([
        // Load bots 
        loadBots().then(bots => {
          setBots(bots);
        }),
        
        // Load admin actions
        loadAdminActions().then(actions => {
          setAdminActions(actions);
        }),
        
        // Load banned users
        loadBannedUsers(),
        
        // Load reports and feedback
        loadReportsAndFeedback(),
        
        // Clean up expired reports
        cleanupExpiredReports()
      ]);
      
      console.log('Dashboard data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      return false;
    }
  }, [isAdmin, loadBots, loadAdminActions, loadBannedUsers, loadReportsAndFeedback, cleanupExpiredReports, setBots, setAdminActions]);
  
  return {
    loadDashboardData
  };
};
