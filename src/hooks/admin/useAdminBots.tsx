import { useState, useCallback, useEffect } from 'react';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import * as adminService from '@/services/admin/adminService';
import { safeHandleError } from '@/utils/safeErrorHandler';

/**
 * Custom hook for bot management functionality in the admin dashboard
 */
export const useAdminBots = (isAdmin: boolean) => {
  const { toast } = useToast();
  const { logError } = useErrorHandler();
  const [bots, setBots] = useState<Bot[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load bots data with error handling
  const loadBots = useCallback(async () => {
    if (!isAdmin) return [];
    
    try {
      const loadedBots = await safeHandleError(
        adminService.getAllBots(),
        [] as Bot[],
        'loadBots'
      );
      
      setBots(loadedBots);
      console.log(`Loaded ${loadedBots.length} bots`);
      
      // Get online users
      const onlineIds = adminService.getOnlineUserIds();
      setOnlineUsers(onlineIds);
      console.log(`Loaded ${onlineIds.length} online users`);
      
      return loadedBots;
    } catch (error) {
      logError(error, 'loadBots');
      return [];
    }
  }, [isAdmin, logError]);
  
  // Bot monitoring - periodically update online status with cleanup
  useEffect(() => {
    if (!isAdmin) return;
    
    const updateOnlineStatus = () => {
      const onlineIds = adminService.getOnlineUserIds();
      setOnlineUsers(onlineIds);
    };
    
    // Update immediately
    updateOnlineStatus();
    
    // Then set interval with a reasonable update frequency
    const intervalId = setInterval(updateOnlineStatus, 10000); // Check every 10 seconds
    
    // Cleanup function to prevent memory leaks
    return () => {
      clearInterval(intervalId);
      // Don't call cleanupUserTracking here - we'll do it in the main useAdmin hook
    };
  }, [isAdmin]);
  
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
      logError(error, 'createBot');
      toast({
        title: 'Error',
        description: 'Failed to create bot',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, logError]);
  
  // Update bot with optimistic updates
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
      logError(error, 'updateBot');
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
        logError(err, 'revertUpdateBot');
      }
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, logError]);
  
  // Delete bot with optimistic update
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
      logError(error, 'deleteBot');
      toast({
        title: 'Error',
        description: 'Failed to delete bot',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, toast, bots, logError]);

  // Track a user's online status with safeguards to prevent duplicate tracking
  const trackUserOnlineStatus = useCallback((userId: string, isOnline: boolean) => {
    if (!isAdmin || !userId) return;
    
    // Add a simple rate limiting to prevent too frequent updates
    const userTrackingKey = `${userId}-${isOnline ? 'online' : 'offline'}`;
    const lastTracked = parseInt(sessionStorage.getItem(userTrackingKey) || '0');
    const now = Date.now();
    
    // Only update if it's been more than 5 seconds since last update of the same type
    if (now - lastTracked > 5000) {
      adminService.trackUserActivity(userId, isOnline);
      sessionStorage.setItem(userTrackingKey, now.toString());
      
      // Only update our local list if we're still mounted
      setOnlineUsers(adminService.getOnlineUserIds());
    }
  }, [isAdmin]);
  
  return {
    bots,
    onlineUsers,
    loadBots,
    createBot,
    updateBot,
    deleteBot,
    trackUserOnlineStatus,
    isProcessing
  };
};
