
import { useState, useCallback } from 'react';
import { Bot } from '@/types/chat';
import { toast } from '@/components/ui/use-toast';
import { supabaseAdmin } from '@/lib/supabase/supabaseAdmin';

export const useAdminBots = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);

  const loadBots = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Loading bots data...');
      
      // Get bots from Supabase
      const { data, error } = await supabaseAdmin
        .from('bots')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      const loadedBots = data || [];
      console.log(`Loaded ${loadedBots.length} bots`);
      setBots(loadedBots as Bot[]);
    } catch (error) {
      console.error('Error getting all bots:', error);
      toast({
        title: "Error loading bots",
        description: "There was a problem loading the bot data.",
        variant: "destructive"
      });
      // Initialize with empty array on error
      setBots([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createBot = useCallback(async (newBot: Omit<Bot, 'id'>) => {
    try {
      // Add bot to Supabase
      const { data, error } = await supabaseAdmin
        .from('bots')
        .insert([newBot])
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state with the new bot that includes the generated ID
        setBots(prev => [...prev, data[0] as Bot]);
        
        toast({
          title: "Bot created",
          description: `${newBot.name} has been created successfully.`
        });
        
        return data[0] as Bot;
      }
      
      throw new Error('No data returned from bot creation');
    } catch (error) {
      console.error('Error creating bot:', error);
      toast({
        title: "Error creating bot",
        description: "There was a problem creating the bot.",
        variant: "destructive"
      });
      return null;
    }
  }, []);

  const updateBot = useCallback(async (botId: string, updates: Partial<Bot>) => {
    try {
      // Update bot in Supabase
      const { data, error } = await supabaseAdmin
        .from('bots')
        .update(updates)
        .eq('id', botId)
        .select();
      
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        // Update local state
        setBots(prev => 
          prev.map(bot => bot.id === botId ? { ...bot, ...updates } : bot)
        );
        
        toast({
          title: "Bot updated",
          description: `Bot ${updates.name || 'profile'} has been updated successfully.`
        });
        
        return true;
      }
      
      throw new Error('No data returned from bot update');
    } catch (error) {
      console.error('Error updating bot:', error);
      toast({
        title: "Error updating bot",
        description: "There was a problem updating the bot.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  const deleteBot = useCallback(async (botId: string) => {
    try {
      // Delete bot from Supabase
      const { error } = await supabaseAdmin
        .from('bots')
        .delete()
        .eq('id', botId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setBots(prev => prev.filter(bot => bot.id !== botId));
      
      toast({
        title: "Bot deleted",
        description: "The bot has been deleted successfully."
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting bot:', error);
      toast({
        title: "Error deleting bot",
        description: "There was a problem deleting the bot.",
        variant: "destructive"
      });
      return false;
    }
  }, []);

  return {
    bots,
    loading,
    loadBots,
    createBot,
    updateBot,
    deleteBot
  };
};
