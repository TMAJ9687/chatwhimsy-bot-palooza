
import { useCallback, useRef } from 'react';
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
  // Track when the last load occurred to prevent too-frequent reloads
  const lastLoadTimeRef = useRef(0);
  const isLoadingRef = useRef(false);
  
  // Combined loader for all dashboard data with extreme throttling
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin || isLoadingRef.current) {
      return false;
    }
    
    // Extremely aggressive throttling - once per 30 seconds maximum
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 30000) {
      return false;
    }
    
    try {
      isLoadingRef.current = true;
      lastLoadTimeRef.current = now;
      
      // Load bots first
      const loadedBots = await loadBots();
      setBots(loadedBots);
      
      // Load other data in sequence (not parallel) to reduce contention
      await loadBannedUsers();
      const actions = await loadAdminActions();
      setAdminActions(actions);
      
      // These operations are less important, so we'll skip them if they've been run recently
      if (now - lastLoadTimeRef.current > 60000) { // Only run once per minute at most
        await loadReportsAndFeedback();
        await cleanupExpiredReports();
      }
      
      return true;
    } catch (error) {
      // We'll just return false on error without rethrowing
      return false;
    } finally {
      isLoadingRef.current = false;
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
