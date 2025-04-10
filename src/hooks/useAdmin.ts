
import { useState, useCallback } from 'react';
import { BanRecord, AdminAction } from '@/types/admin';
import { Bot } from '@/types/chat';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminAuth } from './admin/useAdminAuth';

/**
 * Main admin hook for the admin dashboard
 */
export const useAdmin = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const { isAdmin, authUser } = useAdminAuth();
  
  // Use the admin users hook for user management
  const {
    bannedUsers,
    loadBannedUsers,
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    isProcessing,
  } = useAdminUsers(isAdmin, bots, setBots, setAdminActions, authUser);
  
  // Update a bot's data
  const updateBot = useCallback((id: string, updatedBot: Bot) => {
    setBots(prev => prev.map(bot => 
      bot.id === id ? { ...bot, ...updatedBot } : bot
    ));
  }, []);
  
  return {
    bots,
    setBots,
    adminActions,
    setAdminActions,
    bannedUsers,
    loadBannedUsers,
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    isProcessing,
    updateBot
  };
};
