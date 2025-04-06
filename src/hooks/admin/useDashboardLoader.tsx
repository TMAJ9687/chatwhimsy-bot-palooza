
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
  
  // Combined loader for all dashboard data with throttling
  const loadDashboardData = useCallback(async () => {
    if (!isAdmin) return false;
    
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current) {
      console.log('Dashboard data load already in progress, skipping');
      return false;
    }
    
    // Throttle loading to once per 10 seconds maximum
    const now = Date.now();
    if (now - lastLoadTimeRef.current < 10000) {
      console.log('Dashboard data loaded recently, skipping');
      return false;
    }
    
    try {
      isLoadingRef.current = true;
      console.log('Loading dashboard data...');
      lastLoadTimeRef.current = now;
      
      // Load bots first
      const loadedBots = await loadBots();
      setBots(loadedBots);
      
      // Load other data in sequence (not parallel) to reduce contention
      const bannedUsers = await loadBannedUsers();
      const actions = await loadAdminActions();
      setAdminActions(actions);
      await loadReportsAndFeedback();
      await cleanupExpiredReports();
      
      console.log('Dashboard data loaded successfully');
      return true;
    } catch (error) {
      console.error('Error loading dashboard data:', error);
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
