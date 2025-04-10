
import { useState, useCallback } from 'react';
import { BanRecord, AdminAction } from '@/types/admin';
import { Bot } from '@/types/chat';
import { useAdminUsers } from './admin/useAdminUsers';
import { useAdminAuth } from './admin/useAdminAuth';
import { useAdminReports } from './admin/useAdminReports';
import { useAdminSettings } from './admin/useAdminSettings';

/**
 * Main admin hook for the admin dashboard
 */
export const useAdmin = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const { isAdmin, authUser, changeAdminPassword } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<any[]>([]);
  
  // Admin settings functionality
  const { saveSiteSettings, getSiteSettings } = useAdminSettings(isAdmin);
  
  // Reports functionality
  const {
    reportsFeedback,
    loadReportsAndFeedback,
    resolveReportFeedback,
    deleteReportFeedback
  } = useAdminReports(isAdmin);
  
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
  
  // Admin logout functionality
  const adminLogout = useCallback(async () => {
    // Implementation would go here
    console.log('Admin logout called');
    return true;
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
    updateBot,
    // Add missing properties
    isAdmin,
    adminLogout,
    loading,
    onlineUsers,
    changeAdminPassword,
    // Reports properties
    reportsFeedback,
    loadReportsAndFeedback,
    resolveReportFeedback,
    deleteReportFeedback,
    // Settings properties
    saveSiteSettings,
    getSiteSettings
  };
};
