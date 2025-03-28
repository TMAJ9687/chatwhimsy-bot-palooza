import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import * as adminService from '@/services/admin/adminService';
import { Bot } from '@/types/chat';
import { BanRecord, AdminAction, ReportFeedback, VipDuration } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { debouncedAdminAction } from '@/utils/adminUtils';

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
  
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  
  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    
    const loadAdminData = async () => {
      try {
        setLoading(true);
        console.time('adminDataLoad');
        
        // Initialize the admin service
        adminService.initializeAdminService();
        
        // Load data in pieces to avoid long-running operations
        const loadDataSequentially = async () => {
          // Get data
          const loadedBots = adminService.getAllBots();
          setBots(loadedBots);
          
          // Use setTimeout to give the UI thread a chance to breathe
          setTimeout(() => {
            const loadedBanned = adminService.getBannedUsers();
            setBannedUsers(loadedBanned);
            
            setTimeout(() => {
              const loadedActions = adminService.getAdminActions();
              setAdminActions(loadedActions);
              
              setTimeout(() => {
                const loadedReportsFeedback = adminService.getReportsAndFeedback();
                setReportsFeedback(loadedReportsFeedback);
                setLoading(false);
                console.timeEnd('adminDataLoad');
              }, 0);
            }, 0);
          }, 0);
        };
        
        loadDataSequentially();
      } catch (error) {
        console.error('Error loading admin data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load admin data',
          variant: 'destructive',
        });
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
      
      // Execute the potentially blocking operation in a debounced manner
      let newBot: Bot | null = null;
      await debouncedAdminAction(async () => {
        newBot = adminService.createBot(bot);
      });
      
      if (newBot) {
        setBots(prev => [...prev, newBot!]);
        
        toast({
          title: 'Success',
          description: `Bot ${newBot.name} created successfully`,
        });
      }
      
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
      
      // Optimistic update
      setBots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, ...updates } : bot
      ));
      
      // Execute the potentially blocking operation in a debounced manner
      let updatedBot: Bot | null = null;
      await debouncedAdminAction(async () => {
        updatedBot = adminService.updateBot(id, updates);
      });
      
      if (!updatedBot) {
        // Revert on failure
        setBots(prev => {
          const original = adminService.getAllBots().find(b => b.id === id);
          return prev.map(bot => bot.id === id && original ? original : bot);
        });
        return false;
      }
      
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
      
      // Revert on error
      setBots(prev => {
        const original = adminService.getAllBots().find(b => b.id === id);
        return prev.map(bot => bot.id === id && original ? original : bot);
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
      
      // Optimistic update - store the bot for potential rollback
      const botToDelete = bots.find(bot => bot.id === id);
      setBots(prev => prev.filter(bot => bot.id !== id));
      
      // Execute the potentially blocking operation in a debounced manner
      let success = false;
      await debouncedAdminAction(async () => {
        success = adminService.deleteBot(id);
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Bot deleted successfully',
        });
      } else {
        // Rollback if the operation failed
        if (botToDelete) {
          setBots(prev => [...prev, botToDelete]);
        }
        
        toast({
          title: 'Warning',
          description: 'Could not delete bot',
          variant: 'destructive',
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
  }, [isAdmin, user, toast, bots]);
  
  // User actions
  const kickUser = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
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
      
      // Execute the potentially blocking operation in a debounced manner
      let action: AdminAction | null = null;
      await debouncedAdminAction(async () => {
        action = adminService.kickUser(userId, user.id);
      });
      
      if (action) {
        // Replace temporary action with the real one
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id).concat(action!));
        
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
      
      // Optimistic update for UI
      const tempBanId = `temp-${Date.now()}`;
      const tempBan: BanRecord = {
        id: tempBanId,
        identifier,
        identifierType,
        reason,
        duration,
        timestamp: new Date(),
        adminId: user.id
      };
      
      setBannedUsers(prev => [...prev, tempBan]);
      
      // Execute the potentially blocking operation in a debounced manner
      let banRecord: BanRecord | null = null;
      await debouncedAdminAction(async () => {
        banRecord = adminService.banUser({
          identifier,
          identifierType,
          reason,
          duration,
          adminId: user.id
        });
      });
      
      if (banRecord) {
        // Replace temporary ban with the real one
        setBannedUsers(prev => prev.filter(b => b.id !== tempBanId).concat(banRecord!));
        setAdminActions(adminService.getAdminActions());
        
        toast({
          title: 'Success',
          description: `User ${identifier} banned successfully`,
        });
        
        return banRecord;
      } else {
        // Remove temporary ban if failed
        setBannedUsers(prev => prev.filter(b => b.id !== tempBanId));
        return null;
      }
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
      
      // Keep a copy for rollback
      const banToRemove = bannedUsers.find(ban => ban.id === id);
      
      // Optimistic update
      setBannedUsers(prev => prev.filter(ban => ban.id !== id));
      
      // Execute the potentially blocking operation in a debounced manner
      let success = false;
      await debouncedAdminAction(async () => {
        success = adminService.unbanUser(id, user.id);
      });
      
      if (success) {
        setAdminActions(adminService.getAdminActions());
        
        toast({
          title: 'Success',
          description: 'User unbanned successfully',
        });
      } else if (banToRemove) {
        // Rollback if failed
        setBannedUsers(prev => [...prev, banToRemove]);
        
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
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing, bannedUsers]);
  
  const upgradeToVIP = useCallback(async (userId: string, duration: VipDuration) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
      
      // Optimistic update for UI
      const tempAction: AdminAction = {
        id: `temp-${Date.now()}`,
        actionType: 'upgrade',
        targetId: userId,
        targetType: 'user',
        duration,
        timestamp: new Date(),
        adminId: user.id
      };
      
      setAdminActions(prev => [...prev, tempAction]);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      // Execute the potentially blocking operation in a debounced manner
      let action: AdminAction | null = null;
      await debouncedAdminAction(async () => {
        action = adminService.upgradeToVIP(userId, user.id, duration);
      });
      
      if (action) {
        // Replace temporary action with the real one
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id).concat(action));
        
        toast({
          title: 'Success',
          description: `User upgraded to VIP successfully for ${duration}`,
        });
        
        return true;
      } else {
        // Rollback if failed
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id));
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: false } : bot
        ));
        
        return false;
      }
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
      
      // Optimistic update for UI
      const tempAction: AdminAction = {
        id: `temp-${Date.now()}`,
        actionType: 'downgrade',
        targetId: userId,
        targetType: 'user',
        timestamp: new Date(),
        adminId: user.id
      };
      
      setAdminActions(prev => [...prev, tempAction]);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      // Execute the potentially blocking operation in a debounced manner
      let action: AdminAction | null = null;
      await debouncedAdminAction(async () => {
        action = adminService.downgradeToStandard(userId, user.id);
      });
      
      if (action) {
        // Replace temporary action with the real one
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id).concat(action));
        
        toast({
          title: 'Success',
          description: 'User downgraded to standard successfully',
        });
        
        return true;
      } else {
        // Rollback if failed
        setAdminActions(prev => prev.filter(a => a.id !== tempAction.id));
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: true } : bot
        ));
        
        return false;
      }
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
      // Optimistic update
      const tempReport: ReportFeedback = {
        id: `temp-${Date.now()}`,
        type: 'report',
        userId,
        content,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolved: false
      };
      
      setReportsFeedback(prev => [...prev, tempReport]);
      
      // Execute the potentially blocking operation in a debounced manner
      let report: ReportFeedback | null = null;
      await debouncedAdminAction(async () => {
        report = adminService.addReportOrFeedback('report', userId, content);
      });
      
      if (report) {
        // Replace temporary report with the real one
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id).concat(report!));
        
        toast({
          title: 'Report Submitted',
          description: 'Your report has been submitted to our admins',
        });
      } else {
        // Remove temporary report if failed
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id));
      }
      
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
      // Optimistic update
      const tempFeedback: ReportFeedback = {
        id: `temp-${Date.now()}`,
        type: 'feedback',
        userId: user.id,
        content,
        timestamp: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        resolved: false
      };
      
      setReportsFeedback(prev => [...prev, tempFeedback]);
      
      // Execute the potentially blocking operation in a debounced manner
      let feedback: ReportFeedback | null = null;
      await debouncedAdminAction(async () => {
        feedback = adminService.addReportOrFeedback('feedback', user.id, content);
      });
      
      if (feedback) {
        // Replace temporary feedback with the real one
        setReportsFeedback(prev => prev.filter(f => f.id !== tempFeedback.id).concat(feedback!));
        
        toast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback',
        });
      } else {
        // Remove temporary feedback if failed
        setReportsFeedback(prev => prev.filter(f => f.id !== tempFeedback.id));
      }
      
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
      // Optimistic update
      setReportsFeedback(prev => 
        prev.map(item => item.id === id ? { ...item, resolved: true } : item)
      );
      
      // Execute the potentially blocking operation in a debounced manner
      let success = false;
      await debouncedAdminAction(async () => {
        success = adminService.resolveReportOrFeedback(id);
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item marked as resolved',
        });
      } else {
        // Rollback if failed
        setReportsFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, resolved: false } : item)
        );
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
      // Keep a copy for rollback
      const itemToDelete = reportsFeedback.find(item => item.id === id);
      
      // Optimistic update
      setReportsFeedback(prev => prev.filter(item => item.id !== id));
      
      // Execute the potentially blocking operation in a debounced manner
      let success = false;
      await debouncedAdminAction(async () => {
        success = adminService.deleteReportOrFeedback(id);
      });
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
      } else if (itemToDelete) {
        // Rollback if failed
        setReportsFeedback(prev => [...prev, itemToDelete]);
        
        toast({
          title: 'Warning',
          description: 'Could not delete item',
          variant: 'destructive',
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
  }, [isAdmin, toast, reportsFeedback]);
  
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
