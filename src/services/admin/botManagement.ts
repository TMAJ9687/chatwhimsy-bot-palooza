
import { Bot } from '@/types/chat';
import * as firestoreService from '@/firebase/firestore';
import { botProfiles } from '@/data/botProfiles';

/**
 * Get all bots from Firestore or fallback to local data
 */
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    const bots = await firestoreService.getAllBots();
    
    // If Firestore returned empty results or failed, use local data
    if (!bots || bots.length === 0) {
      console.log('Using local bot profiles as fallback');
      return botProfiles;
    }
    
    return bots;
  } catch (error) {
    console.error('Error getting bots from Firestore, using local fallback:', error);
    return botProfiles;
  }
};

/**
 * Get a specific bot by ID
 */
export const getBot = async (id: string): Promise<Bot | undefined> => {
  return await firestoreService.getBot(id);
};

/**
 * Create a new bot
 */
export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot> => {
  return await firestoreService.createBot(bot);
};

/**
 * Update an existing bot
 */
export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  return await firestoreService.updateBot(id, updates);
};

/**
 * Delete a bot
 */
export const deleteBot = async (id: string): Promise<boolean> => {
  return await firestoreService.deleteBot(id);
};
