import { useState, useEffect, useCallback } from 'react';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';
import { AdminAction } from '@/firebase/firestore/adminActionCollection';
import { BanRecord } from '@/firebase/firestore/banCollection';

interface UseAdminHook {
  adminActions: AdminAction[];
  bannedUsers: BanRecord[];
  loading: boolean;
  loadAdminActions: () => Promise<void>;
  loadBannedUsers: () => Promise<void>;
  logAdminAction: (action: Omit<AdminAction, 'id' | 'timestamp'>) => Promise<AdminAction | null>;
  banUser: (banData: Omit<BanRecord, 'id'>) => Promise<BanRecord | null>;
  unbanUser: (banId: string) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
}

const useAdmin = (): UseAdminHook => {
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  /**
   * Load admin actions from Supabase
   */
  const loadAdminActions = useCallback(async () => {
    setLoading(true);
    try {
      const actions = await supabaseAdmin.getAdminActions();
      setAdminActions(actions);
    } catch (error) {
      console.error('Error loading admin actions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load banned users from Supabase
   */
  const loadBannedUsers = useCallback(async () => {
    setLoading(true);
    try {
      const users = await supabaseAdmin.getBannedUsers();
      setBannedUsers(users);
    } catch (error) {
      console.error('Error loading banned users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminActions();
    loadBannedUsers();
  }, [loadAdminActions, loadBannedUsers]);

  /**
   * Log a new admin action
   * @param action - Admin action data
   */
  const logAdminAction = async (action: Omit<AdminAction, 'id' | 'timestamp'>): Promise<AdminAction | null> => {
    try {
      const newAction = await supabaseAdmin.logAdminAction(action);
      if (newAction) {
        setAdminActions(prevActions => [...prevActions, newAction]);
        return newAction;
      }
      return null;
    } catch (error) {
      console.error('Error logging admin action:', error);
      return null;
    }
  };

  /**
   * Ban a user
   * @param banData - Ban record data
   */
  const handleBanUser = async (banData: Omit<BanRecord, 'id'>): Promise<BanRecord | null> => {
    try {
      const newBan = await supabaseAdmin.banUser(banData);
      if (newBan) {
        setBannedUsers(prevBannedUsers => [...prevBannedUsers, newBan]);
        return newBan;
      }
      return null;
    } catch (error) {
      console.error('Error banning user:', error);
      return null;
    }
  };

  /**
   * Unban a user
   * @param banId - Ban record ID
   */
  const handleUnbanUser = async (banId: string): Promise<boolean> => {
    try {
      const success = await supabaseAdmin.unbanUser(banId);
      if (success) {
        setBannedUsers(prevBannedUsers => prevBannedUsers.filter(user => user.id !== banId));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error unbanning user:', error);
      return false;
    }
  };

  /**
   * Delete a user
   * @param userId - User ID to delete
   */
  const deleteUser = async (userId: string): Promise<boolean> => {
    try {
      // Implementation placeholder - would delete the user
      console.log('Deleting user:', userId);
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  };

  return {
    adminActions,
    bannedUsers,
    loading,
    loadAdminActions,
    loadBannedUsers,
    logAdminAction,
    banUser: handleBanUser,
    unbanUser: handleUnbanUser,
    deleteUser
  };
};

export default useAdmin;
