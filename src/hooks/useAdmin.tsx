
import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/context/UserContext';
import * as adminService from '@/services/admin/adminService';
import { Bot } from '@/types/chat';
import { BanRecord, AdminAction, ReportFeedback, VipDuration } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';

export const useAdmin = () => {
  const { user, isVip } = useUser();
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [reportsFeedback, setReportsFeedback] = useState<ReportFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        const loadedReportsFeedback = adminService.getReportsAndFeedback();
        
        // Update state
        setBots(loadedBots);
        setBannedUsers(loadedBanned);
        setAdminActions(loadedActions);
        setReportsFeedback(loadedReportsFeedback);
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
    
    // Set up interval to periodically clean up expired reports/feedback
    const cleanupInterval = setInterval(() => {
      if (isAdmin) {
        adminService.cleanupExpiredReportsFeedback();
        setReportsFeedback(adminService.getReportsAndFeedback());
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isAdmin, toast]);
  
  // Bot management
  const createBot = useCallback(async (bot: Omit<Bot, 'id'>) => {
    if (!isAdmin || !user) return null;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast]);
  
  const updateBot = useCallback(async (id: string, updates: Partial<Bot>) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast]);
  
  const deleteBot = useCallback(async (id: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast]);
  
  // User actions
  const kickUser = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  const banUser = useCallback(async (
    identifier: string,
    identifierType: 'user' | 'ip',
    reason: string,
    duration: string
  ) => {
    if (!isAdmin || !user) return null;
    if (isProcessing) return null;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  const unbanUser = useCallback(async (id: string) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  const upgradeToVIP = useCallback(async (userId: string, duration: VipDuration) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
      adminService.upgradeToVIP(userId, user.id, duration);
      
      // This is a demo, so we'll update a bot's VIP status if it matches
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      setAdminActions(adminService.getAdminActions());
      
      toast({
        title: 'Success',
        description: `User upgraded to VIP successfully for ${duration}`,
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  const downgradeToStandard = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
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
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  // Reports and Feedback
  const addReport = useCallback(async (userId: string, content: string) => {
    if (!user) return null;
    
    try {
      const report = adminService.addReportOrFeedback('report', userId, content);
      setReportsFeedback(prev => [...prev, report]);
      
      toast({
        title: 'Report Submitted',
        description: 'Your report has been submitted to our admins',
      });
      
      return report;
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit report',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);
  
  const addFeedback = useCallback(async (content: string) => {
    if (!user) return null;
    
    try {
      const feedback = adminService.addReportOrFeedback('feedback', user.id, content);
      setReportsFeedback(prev => [...prev, feedback]);
      
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback',
      });
      
      return feedback;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);
  
  const resolveReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      const success = adminService.resolveReportOrFeedback(id);
      if (success) {
        setReportsFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, resolved: true } : item)
        );
        
        toast({
          title: 'Success',
          description: 'Item marked as resolved',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error resolving item:', error);
      toast({
        title: 'Error',
        description: 'Failed to resolve item',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, toast]);
  
  const deleteReportFeedback = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      const success = adminService.deleteReportOrFeedback(id);
      if (success) {
        setReportsFeedback(prev => prev.filter(item => item.id !== id));
        
        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
      }
      
      return success;
    } catch (error) {
      console.error('Error deleting item:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete item',
        variant: 'destructive',
      });
      return false;
    }
  }, [isAdmin, toast]);
  
  // Admin logout
  const adminLogout = useCallback(() => {
    adminService.adminLogout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out of the admin panel',
    });
    return true;
  }, [toast]);
  
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
    isProcessing,
    bots,
    vipUsers,
    standardUsers,
    bannedUsers,
    adminActions,
    reportsFeedback,
    
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
    
    // Reports and Feedback
    addReport,
    addFeedback,
    resolveReportFeedback,
    deleteReportFeedback,
    
    // Admin settings
    changeAdminPassword,
    adminLogout,
    
    // Site settings
    saveSiteSettings,
    getSiteSettings,
  };
};
