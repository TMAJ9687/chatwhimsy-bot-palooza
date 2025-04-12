
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAdminContext } from '@/context/AdminContext';
import { Bot } from '@/types/chat';
import { safeHandleError } from '@/utils/safeErrorHandler';
import * as adminService from '@/services/admin/adminService';

/**
 * Hook for bot management functionality that uses the AdminContext
 */
export const useAdminBots = () => {
  const { 
    isAdmin, 
    setBots, 
    setOnlineUsers 
  } = useAdminContext();
  
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const trackedUsersRef = useRef(new Set<string>());
  const onlineUpdateTimerRef = useRef<NodeJS.Timeout | null>(null);
  
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
      console.error('Error in loadBots:', error);
      return [];
    }
  }, [isAdmin, setBots, setOnlineUsers]);
  
  // Bot monitoring - periodically update online status
  useEffect(() => {
    if (!isAdmin) return;
    
    const updateOnlineStatus = () => {
      const onlineIds = adminService.getOnlineUserIds();
      setOnlineUsers(onlineIds);
    };
    
    // Update immediately on first load
    updateOnlineStatus();
    
    // Then set interval
    onlineUpdateTimerRef.current = setInterval(updateOnlineStatus, 30000);
    
    return () => {
      if (onlineUpdateTimerRef.current) {
        clearInterval(onlineUpdateTimerRef.current);
        onlineUpdateTimerRef.current = null;
      }
    };
  }, [isAdmin, setOnlineUsers]);
  
  // Create a new bot
  const createBot = useCallback(async (bot: Omit<Bot, 'id'>) => {
    if (!isAdmin) return null;
    
    try {
      setIsProcessing(true);
      const newBot = await adminService.createBot(bot);
      
      if (newBot) {
        setBots(prev => [...prev, newBot]);
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
  }, [isAdmin, setBots, toast]);
  
  // Update an existing bot
  const updateBot = useCallback(async (id: string, updates: Partial<Bot>) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
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
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [isAdmin, setBots, toast]);
  
  // Delete a bot
  const deleteBot = useCallback(async (id: string) => {
    if (!isAdmin) return false;
    
    try {
      setIsProcessing(true);
      
      // Store the bot for potential rollback
      const botToDelete = (await adminService.getAllBots()).find(bot => bot.id === id);
      
      // Optimistic update
      setBots(prev => prev.filter(bot => bot.id !== id));
      
      const success = await adminService.deleteBot(id);
      
      if (!success && botToDelete) {
        // Rollback if the operation failed
        setBots(prev => [...prev, botToDelete]);
        
        toast({
          title: 'Warning',
          description: 'Could not delete bot',
          variant: 'destructive',
        });
      } else {
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
  }, [isAdmin, setBots, toast]);
  
  // Track user online status
  const trackUserOnlineStatus = useCallback((userId: string, isOnline: boolean) => {
    if (!isAdmin || !userId) return;
    
    if (!trackedUsersRef.current.has(userId)) {
      trackedUsersRef.current.add(userId);
      adminService.trackUserActivity(userId, isOnline);
    }
  }, [isAdmin]);
  
  return {
    loadBots,
    createBot,
    updateBot,
    deleteBot,
    trackUserOnlineStatus,
    isProcessing
  };
};
