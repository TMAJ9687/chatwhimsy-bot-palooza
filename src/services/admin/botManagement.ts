
import { supabase } from '@/integrations/supabase/client';
import { Bot } from '@/types/chat';

/**
 * Get all bots
 */
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bots:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getAllBots:', error);
    return [];
  }
};

/**
 * Create a new bot
 */
export const createBot = async (bot: Partial<Bot>): Promise<Bot | null> => {
  try {
    // Generate a unique ID if not provided
    const botWithId = {
      ...bot,
      id: bot.id || `bot-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    
    const { data, error } = await supabase
      .from('bots')
      .insert([botWithId])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating bot:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in createBot:', error);
    return null;
  }
};

/**
 * Update a bot
 */
export const updateBot = async (botId: string, botData: Partial<Bot>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bots')
      .update(botData)
      .eq('id', botId);
    
    if (error) {
      console.error('Error updating bot:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateBot:', error);
    return false;
  }
};

/**
 * Delete a bot
 */
export const deleteBot = async (botId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('bots')
      .delete()
      .eq('id', botId);
    
    if (error) {
      console.error('Error deleting bot:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteBot:', error);
    return false;
  }
};

/**
 * Get bot details
 */
export const getBotDetails = async (botId: string): Promise<Bot | null> => {
  try {
    const { data, error } = await supabase
      .from('bots')
      .select('*')
      .eq('id', botId)
      .single();
    
    if (error) {
      console.error('Error fetching bot details:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getBotDetails:', error);
    return null;
  }
};
