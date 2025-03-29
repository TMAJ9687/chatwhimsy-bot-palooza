
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc
} from 'firebase/firestore';
import { db } from '../config';
import { Bot } from '@/types/chat';
import { botProfiles } from '@/data/botProfiles';
import { v4 as uuidv4 } from 'uuid';

// Collection name
const BOTS_COLLECTION = 'bots';

// Bot Management
export const getAllBots = async (): Promise<Bot[]> => {
  try {
    const botsSnapshot = await getDocs(collection(db, BOTS_COLLECTION));
    return botsSnapshot.docs.map(doc => doc.data() as Bot);
  } catch (error) {
    console.error('Error getting all bots:', error);
    // Return botProfiles as fallback
    return botProfiles;
  }
};

export const getBot = async (id: string): Promise<Bot | undefined> => {
  try {
    const botDoc = await getDoc(doc(db, BOTS_COLLECTION, id));
    return botDoc.exists() ? botDoc.data() as Bot : undefined;
  } catch (error) {
    console.error('Error getting bot:', error);
    // Return from botProfiles as fallback
    return botProfiles.find(bot => bot.id === id);
  }
};

export const createBot = async (bot: Omit<Bot, 'id'>): Promise<Bot> => {
  try {
    const newBot: Bot = {
      ...bot,
      id: `bot-${uuidv4().slice(0, 8)}`
    };
    
    await setDoc(doc(db, BOTS_COLLECTION, newBot.id), newBot);
    return newBot;
  } catch (error) {
    console.error('Error creating bot:', error);
    throw error;
  }
};

export const updateBot = async (id: string, updates: Partial<Bot>): Promise<Bot | null> => {
  try {
    const botRef = doc(db, BOTS_COLLECTION, id);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) return null;
    
    const updatedBot = { ...botDoc.data(), ...updates } as Bot;
    await updateDoc(botRef, updates);
    return updatedBot;
  } catch (error) {
    console.error('Error updating bot:', error);
    // Find bot in local data and return updated version as fallback
    const localBot = botProfiles.find(bot => bot.id === id);
    if (localBot) {
      return { ...localBot, ...updates };
    }
    return null;
  }
};

export const deleteBot = async (id: string): Promise<boolean> => {
  try {
    const botRef = doc(db, BOTS_COLLECTION, id);
    const botDoc = await getDoc(botRef);
    
    if (!botDoc.exists()) return false;
    
    await deleteDoc(botRef);
    return true;
  } catch (error) {
    console.error('Error deleting bot:', error);
    throw error;
  }
};
