
import { useState, useCallback } from 'react';
import { BanRecord, AdminAction } from '@/types/admin';
import { toast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export const useAdminUsers = () => {
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBannedUsers = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading banned users...');
      
      // Get banned users from Supabase
      const { data, error } = await supabaseAdmin
        .from('banned_users')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const loadedBannedUsers = data || [];
      console.log(`Loaded ${loadedBannedUsers.length} banned users`);
      setBannedUsers(loadedBannedUsers as BanRecord[]);
    } catch (error) {
      console.error('Error getting documents from bannedUsers:', error);
      toast({
        title: "Error loading banned users",
        description: "There was a problem loading the banned users data.",
        variant: "destructive"
      });
      // Initialize with empty array on error
      setBannedUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAdminActions = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading admin actions...');
      
      // Get admin actions from Supabase
      const { data, error } = await supabaseAdmin
        .from('admin_actions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);
      
      if (error) {
        throw error;
      }
      
      const loadedAdminActions = data || [];
      console.log(`Loaded ${loadedAdminActions.length} admin actions`);
      setAdminActions(loadedAdminActions as AdminAction[]);
    } catch (error) {
      console.error('Error getting admin actions:', error);
      toast({
        title: "Error loading admin actions",
        description: "There was a problem loading the admin actions data.",
        variant: "destructive"
      });
      // Initialize with empty array on error
      setAdminActions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const banUser = useCallback(async (userId: string, reason: string, duration?: number) => {
    try {
      const banRecord: Omit<BanRecord, 'id'> = {
        userId,
        reason,
        adminId: 'current-admin', // This should be the actual admin ID
        timestamp: new Date().toISOString(),
        duration,
        expires: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString() : undefined,
      };
      
      // Add ban record to Supabase
      const { data, error } = await supabaseAdmin
        .from('banned_users')
        .insert([banRecord])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state
        setBannedUsers(prev => [...prev, data[0] as BanRecord]);
        
        // Add admin action
        const adminAction: Omit<AdminAction, 'id'> = {
          adminId: 'current-admin', // This should be the actual admin ID
          adminName: 'Admin User', // This should be the actual admin name
          actionType: 'ban',
          details: `Banned user ${userId} for reason: ${reason}`,
          timestamp: new Date().toISOString(),
          userId
        };
        
        await createAdminAction(adminAction);
        
        toast({
          title: "User banned",
          description: `User has been banned successfully.`
        });
        
        return true;
      }
      
      throw new Error('No data returned from user ban');
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: "Error banning user",
        description: "There was a problem banning the user.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const unbanUser = useCallback(async (userId: string) => {
    try {
      // Delete ban record from Supabase
      const { error } = await supabaseAdmin
        .from('banned_users')
        .delete()
        .eq('userId', userId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setBannedUsers(prev => prev.filter(ban => ban.userId !== userId));
      
      // Add admin action
      const adminAction: Omit<AdminAction, 'id'> = {
        adminId: 'current-admin', // This should be the actual admin ID
        adminName: 'Admin User', // This should be the actual admin name
        actionType: 'unban',
        details: `Unbanned user ${userId}`,
        timestamp: new Date().toISOString(),
        userId
      };
      
      await createAdminAction(adminAction);
      
      toast({
        title: "User unbanned",
        description: "The user has been unbanned successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error unbanning user:', error);
      toast({
        title: "Error unbanning user",
        description: "There was a problem unbanning the user.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const createAdminAction = useCallback(async (action: Omit<AdminAction, 'id'>) => {
    try {
      // Add admin action to Supabase
      const { data, error } = await supabaseAdmin
        .from('admin_actions')
        .insert([action])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state
        setAdminActions(prev => [data[0] as AdminAction, ...prev]);
        return data[0] as AdminAction;
      }
      
      throw new Error('No data returned from admin action creation');
    } catch (error) {
      console.error('Error creating admin action:', error);
      return null;
    }
  }, []);

  const deleteUser = useCallback(async (userId: string) => {
    try {
      // First, check if user exists
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) {
        throw userError;
      }
      
      if (!userData) {
        throw new Error('User not found');
      }
      
      // Delete user from Supabase
      const { error } = await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', userId);
      
      if (error) {
        throw error;
      }
      
      // Add admin action
      const adminAction: Omit<AdminAction, 'id'> = {
        adminId: 'current-admin', // This should be the actual admin ID
        adminName: 'Admin User', // This should be the actual admin name
        actionType: 'delete',
        details: `Deleted user ${userId}`,
        timestamp: new Date().toISOString(),
        userId
      };
      
      await createAdminAction(adminAction);
      
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error deleting user",
        description: "There was a problem deleting the user.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    bannedUsers,
    adminActions,
    loading,
    loadBannedUsers,
    loadAdminActions,
    banUser,
    unbanUser,
    deleteUser,
    createAdminAction
  };
};
