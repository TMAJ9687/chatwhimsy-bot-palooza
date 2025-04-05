
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { BanRecord, AdminAction } from '@/types/admin';
import { Bot } from '@/types/chat';
import * as adminService from '@/services/admin/adminService';
import { useAdminVip } from './useAdminVip';

/**
 * Custom hook for user management functionality
 */
export const useAdminUsers = (
  isAdmin: boolean, 
  bots: Bot[], 
  setBots: React.Dispatch<React.SetStateAction<Bot[]>>,
  setAdminActions: React.Dispatch<React.SetStateAction<AdminAction[]>>,
  user: { id: string } | null
) => {
  const { toast } = useToast();
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [isUserProcessing, setIsUserProcessing] = useState(false);
  
  // Import VIP management from separate hook
  const { 
    upgradeToVIP, 
    downgradeToStandard, 
    isProcessing: isVipProcessing 
  } = useAdminVip(isAdmin, user, setBots, setAdminActions);
  
  // Load banned users data
  const loadBannedUsers = useCallback(async () => {
    if (!isAdmin) return [];
    
    try {
      console.log('Loading banned users...');
      const loadedBanned = await adminService.getBannedUsers();
      setBannedUsers(loadedBanned);
      console.log(`Loaded ${loadedBanned.length} banned users`);
      return loadedBanned;
    } catch (error) {
      console.error('Error loading banned users:', error);
      return [];
    }
  }, [isAdmin]);
  
  // User actions
  const kickUser = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    if (isUserProcessing) return false;
    
    try {
      setIsUserProcessing(true);
      console.log('Kicking user:', userId);
      
      // Optimistic update
      const tempAction: AdminAction = {
        id: `temp-${Date.now()}`,
        actionType: 'kick',
        targetId: userId,
        targetType: 'user',
        timestamp: new Date(),
        adminId: user.id
      };
      
      setAdminActions(prev => [...prev, tempAction]);
      
      const action = await adminService.kickUser(userId, user.id);
      
      if (action) {
        // Replace temporary action with the real one
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id).concat(action));
        
        toast({
          title: 'Success',
          description: 'User kicked successfully',
        });
        console.log('User kicked successfully');
        
        return true;
      } else {
        // Remove temporary action if failed
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id));
        console.error('User kick failed');
        return false;
      }
    } catch (error) {
      console.error('Error kicking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to kick user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUserProcessing(false);
    }
  }, [isAdmin, user, toast, isUserProcessing, setAdminActions]);
  
  const banUser = useCallback(async (
    identifier: string,
    identifierType: 'user' | 'ip',
    reason: string,
    duration: string
  ) => {
    if (!isAdmin || !user) return null;
    if (isUserProcessing) return null;
    
    try {
      setIsUserProcessing(true);
      
      const banRecord = await adminService.banUser({
        identifier,
        identifierType,
        reason,
        duration,
        adminId: user.id
      });
      
      if (banRecord) {
        setBannedUsers(prev => [...prev, banRecord]);
        
        // Refresh admin actions
        const updatedActions = await adminService.getAdminActions();
        setAdminActions(updatedActions);
        
        toast({
          title: 'Success',
          description: `User ${identifier} banned successfully`,
        });
      }
      
      return banRecord;
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsUserProcessing(false);
    }
  }, [isAdmin, user, toast, isUserProcessing, setAdminActions]);
  
  const unbanUser = useCallback(async (id: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsUserProcessing(true);
      
      // Optimistic update
      setBannedUsers(prev => prev.filter(ban => ban.id !== id));
      
      const success = await adminService.unbanUser(id, user.id);
      
      if (success) {
        // Refresh admin actions
        const updatedActions = await adminService.getAdminActions();
        setAdminActions(updatedActions);
        
        toast({
          title: 'Success',
          description: 'User unbanned successfully',
        });
      } else {
        // Revert on failure
        const allBannedUsers = await adminService.getBannedUsers();
        setBannedUsers(allBannedUsers);
        
        toast({
          title: 'Warning',
          description: 'Could not unban user',
          variant: 'destructive',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to unban user',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsUserProcessing(false);
    }
  }, [isAdmin, user, toast, setAdminActions]);
  
  const isProcessing = isUserProcessing || isVipProcessing;
  
  return {
    bannedUsers,
    loadBannedUsers,
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    isProcessing
  };
};
