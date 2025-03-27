
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import * as adminService from '@/services/admin/adminService';
import { Bot } from '@/types/chat';
import { BanRecord, AdminAction } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { user, isVip } = useUser();
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Computed properties
  const isAdmin = user?.isAdmin === true;
  
  // VIP users who are online (we'll simulate this with vip=true in bot profiles)
  const vipUsers = bots.filter(bot => bot.vip);
  
  // Standard users who are online (vip=false in bot profiles)
  const standardUsers = bots.filter(bot => !bot.vip);
  
  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    
    const loadAdminData = async () => {
      try {
        setLoading(true);
        // Initialize the admin service
        adminService.initializeAdminService();
        
        // Get data
        const loadedBots = adminService.getAllBots();
        const loadedBanned = adminService.getBannedUsers();
        const loadedActions = adminService.getAdminActions();
        
        // Update state
        setBots(loadedBots);
        setBannedUsers(loadedBanned);
        setAdminActions(loadedActions);
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadAdminData();
  }, [isAdmin, toast]);
  
  // Bot management
  const createBot = useCallback(async (bot: Omit<Bot, 'id'>) => {
    if (!isAdmin || !user) return null;
    
    try {
      const newBot = adminService.createBot(bot);
      setBots(prev => [...prev, newBot]);
      
      toast({
        title: 'Success',
        description: `Bot ${newBot.name} created successfully`,
      });
      
      return newBot;
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to create bot',
        variant: 'destructive',
      });
      return null;
    }
  }, [isAdmin, user, toast]);
  
  const updateBot = useCallback(async (id: string, updates: Partial<Bot>) => {
    if (!isAdmin || !user) return false;
    
    try {
      const updatedBot = adminService.updateBot(id, updates);
      if (!updatedBot) return false;
      
      setBots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, ...updates } : bot
      ));
      
      toast({
        title: 'Success',
        description: `Bot ${updatedBot.name} updated successfully`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bot',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, user, toast]);
  
  const deleteBot = useCallback(async (id: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      const success = adminService.deleteBot(id);
      if (success) {
        setBots(prev => prev.filter(bot => bot.id !== id));
        
        toast({
          title: 'Success',
          description: 'Bot deleted successfully',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete bot',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, user, toast]);
  
  // User actions
  const kickUser = useCallback((userId: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      adminService.kickUser(userId, user.id);
      
      // Refresh actions
      setAdminActions(adminService.getAdminActions());
      
      toast({
        title: 'Success',
        description: 'User kicked successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error kicking user:', error);
      toast({
        title: 'Error',
        description: 'Failed to kick user',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, user, toast]);
  
  const banUser = useCallback((
    identifier: string,
    identifierType: 'user' | 'ip',
    reason: string,
    duration: string
  ) => {
    if (!isAdmin || !user) return null;
    
    try {
      const banRecord = adminService.banUser({
        identifier,
        identifierType,
        reason,
        duration,
        adminId: user.id
      });
      
      // Update state
      setBannedUsers(prev => [...prev, banRecord]);
      setAdminActions(adminService.getAdminActions());
      
      toast({
        title: 'Success',
        description: `User ${identifier} banned successfully`,
      });
      
      return banRecord;
    } catch (error) {
      console.error('Error banning user:', error);
      toast({
        title: 'Error',
        description: 'Failed to ban user',
        variant: 'destructive',
      });
      return null;
    }
  }, [isAdmin, user, toast]);
  
  const unbanUser = useCallback((id: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      const success = adminService.unbanUser(id, user.id);
      if (success) {
        // Update state
        setBannedUsers(prev => prev.filter(ban => ban.id !== id));
        setAdminActions(adminService.getAdminActions());
        
        toast({
          title: 'Success',
          description: 'User unbanned successfully',
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
    }
  }, [isAdmin, user, toast]);
  
  const upgradeToVIP = useCallback((userId: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      adminService.upgradeToVIP(userId, user.id);
      
      // This is a demo, so we'll update a bot's VIP status if it matches
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      setAdminActions(adminService.getAdminActions());
      
      toast({
        title: 'Success',
        description: 'User upgraded to VIP successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error upgrading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to upgrade user',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, user, toast]);
  
  const downgradeToStandard = useCallback((userId: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      adminService.downgradeToStandard(userId, user.id);
      
      // This is a demo, so we'll update a bot's VIP status if it matches
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      setAdminActions(adminService.getAdminActions());
      
      toast({
        title: 'Success',
        description: 'User downgraded to standard successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Error downgrading user:', error);
      toast({
        title: 'Error',
        description: 'Failed to downgrade user',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, user, toast]);
  
  // Admin settings
  const changeAdminPassword = useCallback((currentPassword: string, newPassword: string) => {
    // In a real app, this would call an API to change the password
    // For this demo, just simulate success if current password matches hardcoded value
    if (currentPassword !== 'admin123') {
      toast({
        title: 'Error',
        description: 'Current password is incorrect',
        variant: 'destructive',
      });
      return false;
    }
    
    toast({
      title: 'Success',
      description: 'Password changed successfully',
    });
    return true;
  }, [toast]);
  
  // Site settings (simulated)
  const saveSiteSettings = useCallback((settingType: string, data: any) => {
    if (!isAdmin) return false;
    
    // Save to localStorage for demonstration
    localStorage.setItem(`adminSettings_${settingType}`, JSON.stringify(data));
    
    toast({
      title: 'Success',
      description: `${settingType} settings saved successfully`,
    });
    
    return true;
  }, [isAdmin, toast]);
  
  const getSiteSettings = useCallback((settingType: string) => {
    const settings = localStorage.getItem(`adminSettings_${settingType}`);
    return settings ? JSON.parse(settings) : null;
  }, []);
  
  return {
    // State
    isAdmin,
    loading,
    bots,
    vipUsers,
    standardUsers,
    bannedUsers,
    adminActions,
    
    // Bot management
    createBot,
    updateBot,
    deleteBot,
    
    // User actions
    kickUser,
    banUser,
    unbanUser,
    upgradeToVIP,
    downgradeToStandard,
    
    // Admin settings
    changeAdminPassword,
    
    // Site settings
    saveSiteSettings,
    getSiteSettings,
  };
};
