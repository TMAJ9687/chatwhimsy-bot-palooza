import { useState, useEffect, useCallback, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import * as adminService from '@/services/admin/adminService';
import { Bot } from '@/types/chat';
import { BanRecord, AdminAction, ReportFeedback, VipDuration } from '@/types/admin';
import { useToast } from '@/hooks/use-toast';
import { debouncedAdminAction } from '@/utils/adminUtils';
import { onAuthStateChange, isUserAdmin } from '@/firebase/auth';

export const useAdmin = () => {
  const { user, setUser } = useUser();
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BanRecord[]>([]);
  const [adminActions, setAdminActions] = useState<AdminAction[]>([]);
  const [reportsFeedback, setReportsFeedback] = useState<ReportFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<any>(null);
  
  // Computed properties
  const isAdmin = useMemo(() => {
    // Check both React state and Firebase auth
    return (user?.isAdmin === true) || (firebaseUser && isUserAdmin(firebaseUser));
  }, [user, firebaseUser]);
  
  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChange((fbUser) => {
      setFirebaseUser(fbUser);
      
      // If Firebase user is admin but user context doesn't have admin flag
      if (fbUser && isUserAdmin(fbUser) && (!user || !user.isAdmin)) {
        // Update user context with admin status
        setUser(prevUser => {
          if (!prevUser) {
            // Create new user if none exists
            return {
              id: 'admin-user',
              nickname: 'Admin',
              email: fbUser.email || 'admin@example.com',
              gender: 'male',
              age: 30,
              country: 'US',
              interests: ['Administration'],
              isVip: true,
              isAdmin: true,
              subscriptionTier: 'none',
              imagesRemaining: Infinity,
              voiceMessagesRemaining: Infinity
            };
          }
          
          // Update existing user
          return {
            ...prevUser,
            isAdmin: true,
            email: fbUser.email || prevUser.email
          };
        });
      }
    });
    
    return () => {
      unsubscribe();
    };
  }, [setUser, user]);
  
  // Memoized derived data to prevent unnecessary recalculations
  const vipUsers = useMemo(() => bots.filter(bot => bot.vip), [bots]);
  const standardUsers = useMemo(() => bots.filter(bot => !bot.vip), [bots]);
  
  // Load data
  useEffect(() => {
    if (!isAdmin) return;
    
    const loadAdminData = async () => {
      try {
        setLoading(true);
        console.log('Starting admin data load...');
        console.time('adminDataLoad');
        
        // Initialize the admin service
        await adminService.initializeAdminService();
        
        // Load data in batches with setTimeout to avoid blocking UI
        const loadBotsData = async () => {
          console.log('Loading bots data...');
          const loadedBots = await adminService.getAllBots();
          setBots(loadedBots);
          console.log(`Loaded ${loadedBots.length} bots`);
          
          setTimeout(loadBannedData, 10);
        };
        
        const loadBannedData = async () => {
          console.log('Loading banned users...');
          const loadedBanned = await adminService.getBannedUsers();
          setBannedUsers(loadedBanned);
          console.log(`Loaded ${loadedBanned.length} banned users`);
          
          setTimeout(loadActionsData, 10);
        };
        
        const loadActionsData = async () => {
          console.log('Loading admin actions...');
          const loadedActions = await adminService.getAdminActions();
          setAdminActions(loadedActions);
          console.log(`Loaded ${loadedActions.length} admin actions`);
          
          setTimeout(loadReportsData, 10);
        };
        
        const loadReportsData = async () => {
          console.log('Loading reports and feedback...');
          const loadedReportsFeedback = await adminService.getReportsAndFeedback();
          setReportsFeedback(loadedReportsFeedback);
          console.log(`Loaded ${loadedReportsFeedback.length} reports/feedback`);
          
          setLoading(false);
          console.timeEnd('adminDataLoad');
          console.log('Admin data loading complete!');
        };
        
        // Start loading sequence
        loadBotsData();
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
    const cleanupInterval = setInterval(async () => {
      if (isAdmin) {
        await adminService.cleanupExpiredReportsFeedback();
        const updatedReports = await adminService.getReportsAndFeedback();
        setReportsFeedback(updatedReports);
      }
    }, 60000); // Check every minute
    
    return () => {
      clearInterval(cleanupInterval);
    };
  }, [isAdmin, toast]);
  
  // Bot management
  const createBot = useCallback(async (bot: Omit<Bot, 'id'>) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      console.log('Creating bot:', bot.name);
      
      const newBot = await adminService.createBot(bot);
      
      if (newBot) {
        setBots(prev => [...prev, newBot]);
        
        toast({
          title: 'Success',
          description: `Bot ${newBot.name} created successfully`,
        });
        console.log('Bot created successfully:', newBot.id);
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
  }, [isAdmin, toast]);
  
  const updateBot = useCallback(async (id: string, updates: Partial<Bot>) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      console.log('Updating bot:', id);
      
      // Optimistic update
      setBots(prev => prev.map(bot => 
        bot.id === id ? { ...bot, ...updates } : bot
      ));
      
      const updatedBot = await adminService.updateBot(id, updates);
      
      if (!updatedBot) {
        // Revert on failure
        const originalBot = await adminService.getBot(id);
        setBots(prev => prev.map(bot => 
          bot.id === id && originalBot ? originalBot : bot
        ));
        console.error('Bot update failed');
        return false;
      }
      
      toast({
        title: 'Success',
        description: `Bot ${updatedBot.name} updated successfully`,
      });
      console.log('Bot updated successfully');
      
      return true;
    } catch (error) {
      console.error('Error updating bot:', error);
      toast({
        title: 'Error',
        description: 'Failed to update bot',
        variant: 'destructive',
      });
      
      // Revert on error - fetch fresh data
      try {
        const originalBot = await adminService.getBot(id);
        setBots(prev => prev.map(bot => 
          bot.id === id && originalBot ? originalBot : bot
        ));
      } catch (err) {
        console.error('Failed to fetch original bot data for revert:', err);
      }
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast]);
  
  const deleteBot = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      console.log('Deleting bot:', id);
      
      // Optimistic update - store the bot for potential rollback
      const botToDelete = bots.find(bot => bot.id === id);
      setBots(prev => prev.filter(bot => bot.id !== id));
      
      const success = await adminService.deleteBot(id);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'Bot deleted successfully',
        });
        console.log('Bot deleted successfully');
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
        console.error('Bot deletion failed');
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
  }, [isAdmin, toast, bots]);
  
  // User actions
  const kickUser = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    if (isProcessing) return false;
    
    try {
      setIsProcessing(true);
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
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast, isProcessing]);
  
  const unbanUser = useCallback(async (id: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
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
      setIsProcessing(false);
    }
  }, [isAdmin, user, toast]);
  
  const upgradeToVIP = useCallback(async (userId: string, duration: VipDuration) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: true } : bot
      ));
      
      const action = await adminService.upgradeToVIP(userId, user.id, duration);
      
      if (action) {
        // Update admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'Success',
          description: `User upgraded to VIP successfully for ${duration}`,
        });
        
        return true;
      } else {
        // Rollback if failed
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
  }, [isAdmin, user, toast]);
  
  const downgradeToStandard = useCallback(async (userId: string) => {
    if (!isAdmin || !user) return false;
    
    try {
      setIsProcessing(true);
      
      // Update bot's VIP status immediately for better UX
      setBots(prev => prev.map(bot => 
        bot.id === userId ? { ...bot, vip: false } : bot
      ));
      
      const action = await adminService.downgradeToStandard(userId, user.id);
      
      if (action) {
        // Update admin actions list
        setAdminActions(prev => [...prev, action]);
        
        toast({
          title: 'Success',
          description: 'User downgraded to standard successfully',
        });
        
        return true;
      } else {
        // Rollback if failed
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
  }, [isAdmin, user, toast]);
  
  // Reports and Feedback
  const addReport = useCallback(async (userId: string, content: string) => {
    if (!user) return null;
    
    try {
      console.log('Adding report for user:', userId);
      
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
      
      const report = await adminService.addReportOrFeedback('report', userId, content);
      
      if (report) {
        // Replace temporary report with the real one
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id).concat(report));
        
        toast({
          title: 'Report Submitted',
          description: 'Your report has been submitted to our admins',
        });
        console.log('Report submitted successfully');
      } else {
        // Remove temporary report if failed
        setReportsFeedback(prev => prev.filter(r => r.id !== tempReport.id));
        console.error('Report submission failed');
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
      const feedback = await adminService.addReportOrFeedback('feedback', user.id, content);
        
      if (feedback) {
        setReportsFeedback(prev => [...prev, feedback]);
          
        toast({
          title: 'Feedback Submitted',
          description: 'Thank you for your feedback',
        });
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
        
      const success = await adminService.resolveReportOrFeedback(id);
        
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
      // Optimistic update
      setReportsFeedback(prev => prev.filter(item => item.id !== id));
        
      const success = await adminService.deleteReportOrFeedback(id);
        
      if (success) {
        toast({
          title: 'Success',
          description: 'Item deleted successfully',
        });
      } else {
        // Revert on failure by reloading all data
        const updatedReports = await adminService.getReportsAndFeedback();
        setReportsFeedback(updatedReports);
          
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
  }, [isAdmin, toast]);
  
  // Admin logout
  const adminLogout = useCallback(async () => {
    try {
      await adminService.adminLogout();
      
      toast({
        title: 'Logged out',
        description: 'You have been logged out of the admin panel',
      });
      
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to log out',
        variant: 'destructive',
      });
      return false;
    }
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
    banUser: async (identifier, identifierType, reason, duration) => {
      if (!isAdmin || !user) return null;
      
      try {
        setIsProcessing(true);
        
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
        setIsProcessing(false);
      }
    },
    unbanUser: async (id) => {
      if (!isAdmin || !user) return false;
      
      try {
        setIsProcessing(true);
        
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
        setIsProcessing(false);
      }
    },
    upgradeToVIP: async (userId, duration) => {
      if (!isAdmin || !user) return false;
      
      try {
        setIsProcessing(true);
        
        // Update bot's VIP status immediately for better UX
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: true } : bot
        ));
        
        const action = await adminService.upgradeToVIP(userId, user.id, duration);
        
        if (action) {
          // Update admin actions list
          setAdminActions(prev => [...prev, action]);
          
          toast({
            title: 'Success',
            description: `User upgraded to VIP successfully for ${duration}`,
          });
          
          return true;
        } else {
          // Rollback if failed
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
    },
    downgradeToStandard: async (userId) => {
      if (!isAdmin || !user) return false;
      
      try {
        setIsProcessing(true);
        
        // Update bot's VIP status immediately for better UX
        setBots(prev => prev.map(bot => 
          bot.id === userId ? { ...bot, vip: false } : bot
        ));
        
        const action = await adminService.downgradeToStandard(userId, user.id);
        
        if (action) {
          // Update admin actions list
          setAdminActions(prev => [...prev, action]);
          
          toast({
            title: 'Success',
            description: 'User downgraded to standard successfully',
          });
          
          return true;
        } else {
          // Rollback if failed
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
      }
    },
    
    // Reports and Feedback
    addReport,
    addFeedback: async (content) => {
      if (!user) return null;
      
      try {
        const feedback = await adminService.addReportOrFeedback('feedback', user.id, content);
        
        if (feedback) {
          setReportsFeedback(prev => [...prev, feedback]);
          
          toast({
            title: 'Feedback Submitted',
            description: 'Thank you for your feedback',
          });
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
    },
    resolveReportFeedback: async (id) => {
      if (!isAdmin) return false;
      
      try {
        // Optimistic update
        setReportsFeedback(prev => 
          prev.map(item => item.id === id ? { ...item, resolved: true } : item)
        );
        
        const success = await adminService.resolveReportOrFeedback(id);
        
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
    },
    deleteReportFeedback: async (id) => {
      if (!isAdmin) return false;
      
      try {
        // Optimistic update
        setReportsFeedback(prev => prev.filter(item => item.id !== id));
        
        const success = await adminService.deleteReportOrFeedback(id);
        
        if (success) {
          toast({
            title: 'Success',
            description: 'Item deleted successfully',
          });
        } else {
          // Revert on failure by reloading all data
          const updatedReports = await adminService.getReportsAndFeedback();
          setReportsFeedback(updatedReports);
          
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
    },
    
    // Admin settings
    changeAdminPassword: (currentPassword, newPassword) => {
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
    },
    adminLogout,
    
    // Site settings
    saveSiteSettings: (settingType, data) => {
      if (!isAdmin) return false;
      
      // Save to localStorage for demonstration
      localStorage.setItem(`adminSettings_${settingType}`, JSON.stringify(data));
      
      toast({
        title: 'Success',
        description: `${settingType} settings saved successfully`,
      });
      
      return true;
    },
    getSiteSettings: (settingType) => {
      const settings = localStorage.getItem(`adminSettings_${settingType}`);
      return settings ? JSON.parse(settings) : null;
    },
  };
};
