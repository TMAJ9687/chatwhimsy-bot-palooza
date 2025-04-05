
import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Bot } from '@/types/chat';
import { AdminAction } from '@/types/admin';
import { trackAsyncOperation } from '@/utils/performanceMonitor';

/**
 * Custom hook for loading and managing admin dashboard data
 */
export const useAdminDashboard = (
  isAdmin: boolean,
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>,
  loadBots: () => Promise<Bot[]>,
  loadBannedUsers: () => Promise<any[]>,
  loadAdminActions: () => Promise<AdminAction[]>,
  loadReportsAndFeedback: () => Promise<any[]>,
  cleanupExpiredReports: () => Promise<void>
) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);

  // Load data optimized with requestAnimationFrame and chunking
  useEffect(() => {
    if (!isAdmin) return;
    
    let isMounted = true;
    
    const loadAdminData = async () => {
      if (!isMounted) return;
      
      try {
        setLoading(true);
        console.log('Starting admin data load...');
        
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
  }, [isAdmin, toast, loadBots, loadBannedUsers, loadAdminActions, loadReportsAndFeedback, cleanupExpiredReports, setBots, setAdminActions]);

  return {
    loading
  };
};
