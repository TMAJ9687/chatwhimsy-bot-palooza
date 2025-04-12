
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import { BanRecord, AdminAction } from '@/types/admin';
import { getBannedUsers, kickUser, banUser, unbanUser } from '@/services/admin/userAdminService';
import { getAdminActions } from '@/services/admin/adminActionService';
import { useAdminVipManager } from './useAdminVipManagerNew';

/**
 * Hook for user management functionality that uses the AdminContext
 */
export const useAdminUsers = () => {
  const {
    isAdmin,
    currentUser,
    setBots,
    setAdminActions,
    setBannedUsers
  } = useAdminContext();
  
  const { toast } = useToast();
  const [isUserProcessing, setIsUserProcessing] = useState(false);
  
  // Use the VIP manager hook
  const { 
    upgradeToVIP, 
    downgradeToStandard, 
    isProcessing: isVipProcessing 
  } = useAdminVipManager();
  
  // Load banned users data
  const loadBannedUsers = useCallback(async () => {
    if (!isAdmin) return [];
    
    try {
      const loadedBanned = await getBannedUsers();
      setBannedUsers(loadedBanned);
      return loadedBanned;
    } catch (error) {
      console.error('Error loading banned users:', error);
      return [];
    }
  }, [isAdmin, setBannedUsers]);
  
  // Kick a user
  const handleKickUser = useCallback(async (userId: string) => {
    if (!isAdmin || !currentUser) return false;
    if (isUserProcessing) return false;
    
    try {
      setIsUserProcessing(true);
      
      // Optimistic update
      const tempAction: AdminAction = {
        id: `temp-${Date.now()}`,
        actionType: 'kick',
        targetId: userId,
        targetType: 'user',
        timestamp: new Date(),
        adminId: currentUser.id
      };
      
      setAdminActions(prev => [...prev, tempAction]);
      
      const action = await kickUser(userId, currentUser.id);
      
      if (action) {
        // Replace temporary action with the real one
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id).concat(action));
        
        toast({
          title: 'Success',
          description: 'User kicked successfully',
        });
        
        return true;
      } else {
        // Remove temporary action if failed
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id));
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
  }, [isAdmin, currentUser, toast, isUserProcessing, setAdminActions]);
  
  // Ban a user
  const handleBanUser = useCallback(async (
    identifier: string,
    identifierType: 'user' | 'ip',
    reason: string,
    duration: string
  ) => {
    if (!isAdmin || !currentUser) return null;
    if (isUserProcessing) return null;
    
    try {
      setIsUserProcessing(true);
      
      const banRecord = await banUser({
        identifier,
        identifierType,
        reason,
        duration,
        adminId: currentUser.id
      });
      
      if (banRecord) {
        setBannedUsers(prev => [...prev, banRecord]);
        
        // Refresh admin actions
        const updatedActions = await getAdminActions();
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
  }, [isAdmin, currentUser, toast, isUserProcessing, setAdminActions, setBannedUsers]);
  
  // Unban a user
  const handleUnbanUser = useCallback(async (id: string) => {
    if (!isAdmin || !currentUser) return false;
    
    try {
      setIsUserProcessing(true);
      
      // Optimistic update
      setBannedUsers(prev => prev.filter(ban => ban.id !== id));
      
      const success = await unbanUser(id, currentUser.id);
      
      if (success) {
        // Refresh admin actions
        const updatedActions = await getAdminActions();
        setAdminActions(updatedActions);
        
        toast({
          title: 'Success',
          description: 'User unbanned successfully',
        });
      } else {
        // Revert on failure
        const allBannedUsers = await getBannedUsers();
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
  }, [isAdmin, currentUser, toast, setAdminActions, setBannedUsers]);
  
  const isProcessing = isUserProcessing || isVipProcessing;
  
  return {
    loadBannedUsers,
    kickUser: handleKickUser,
    banUser: handleBanUser,
    unbanUser: handleUnbanUser,
    upgradeToVIP,
    downgradeToStandard,
    isProcessing
  };
};
