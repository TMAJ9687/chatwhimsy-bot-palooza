
import { useState, useCallback, useEffect } from 'react';
import { Bot } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import * as adminService from '@/services/admin/adminService';

/**
 * Custom hook for bot management functionality
 */
export const useAdminBots = (isAdmin: boolean) => {
  const { toast } = useToast();
  const [bots, setBots] = useState<Bot[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Load bots data
  const loadBots = useCallback(async () => {
    if (!isAdmin) return;
    
    try {
      const loadedBots = await adminService.getAllBots();
      setBots(loadedBots);
      console.log(`Loaded ${loadedBots.length} bots`);
      
      // Get online users
      const onlineIds = adminService.getOnlineUserIds();
      setOnlineUsers(onlineIds);
      console.log(`Loaded ${onlineIds.length} online users`);
      
      return loadedBots;
    } catch (error) {
      console.error('Error loading bots:', error);
      return [];
    }
  }, [isAdmin]);
  
  // Bot monitoring - periodically update online status
  useEffect(() => {
    if (!isAdmin) return;
    
    const intervalId = setInterval(async () => {
      const onlineIds = adminService.getOnlineUserIds();
      setOnlineUsers(onlineIds);
    }, 10000); // Check every 10 seconds
    
    return () => clearInterval(intervalId);
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

  // Track a user's online status
  const trackUserOnlineStatus = useCallback((userId: string, isOnline: boolean) => {
    if (!isAdmin) return;
    
    adminService.trackUserActivity(userId, isOnline);
    // Update our local list of online users
    setOnlineUsers(adminService.getOnlineUserIds());
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
