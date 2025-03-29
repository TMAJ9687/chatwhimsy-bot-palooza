
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AdminAction } from '@/types/admin';
import * as adminService from '@/services/admin/adminService';

/**
 * Custom hook for admin actions functionality
 */
export const useAdminActions = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  
  // Load admin actions
  const loadAdminActions = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      console.log('Loading admin actions...');
      const loadedActions = await adminService.getAdminActions();
      setAdminActions(loadedActions);
      console.log(`Loaded ${loadedActions.length} admin actions`);
      return loadedActions;
    } catch (error) {
      console.error('Error loading admin actions:', error);
      return [];
    }
  }, [isAdmin]);
  
  return {
    adminActions,
    setAdminActions,
    loadAdminActions
  };
};
