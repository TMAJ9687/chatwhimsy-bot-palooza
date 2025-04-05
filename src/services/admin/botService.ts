
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { getOnlineUserIds } from './userService';

/**
 * Bot management functions
 */
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    // Use the bot profiles from chat data instead of mock data
    // This connects the admin dashboard with the actual bots in the chat
    const bots = [...botProfiles];
    
    // Get online user IDs
    const onlineUserIds = getOnlineUserIds();
    
    // Add online status to the bots
    return bots.map(bot => ({
      ...bot,
      // Check if this bot is in our online users set
      isOnline: onlineUserIds.includes(bot.id)
    }));
  } catch (error) {
    console.error('Error getting bots:', error);
    return [];
  }
};

export const getBot = async (id: string): Promise<Bot | null> => {
  try {
    const bots = await getAllBots();
    return bots.find(bot => bot.id === id) || null;
  } catch (error) {
    console.error('Error getting bot:', error);
    return null;
  }
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot | null> => {
  try {
    // Create a new bot with a unique ID
    const newBot: Bot = {
      ...bot,
      id: `bot-${Date.now()}`
    };
    
    // In a real implementation, this would save to the database
    console.log('Created new bot:', newBot);
    
    return newBot;
  } catch (error) {
    console.error('Error creating bot:', error);
    return null;
  }
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  try {
    // Get the existing bot
    const existingBot = await getBot(id);
    if (!existingBot) {
      console.error('Bot not found:', id);
      return null;
    }
    
    // Update the bot with the new data
    const updatedBot: Bot = {
      ...existingBot,
      ...updates
    };
    
    // In a real implementation, this would save to the database
    console.log('Updated bot:', updatedBot);
    
    return updatedBot;
  } catch (error) {
    console.error('Error updating bot:', error);
    return null;
  }
};

export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    // In a real implementation, this would delete from the database
    console.log('Deleted bot:', id);
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    return false;
  }
};
