
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config';
import { Message } from '@/types/chat';

// Constants for chat history
const CHAT_HISTORY_COLLECTION = 'chatHistory';
const MESSAGE_TTL_HOURS = 8; // 8 hours retention for VIP chat history

/**
 * Save a chat conversation to Firestore
 * @param userId The user ID
 * @param botId The bot ID
 * @param messages Array of messages in the conversation
 * @returns Promise that resolves when saving is complete
 */
export const saveChatHistory = async (
  userId: string,
  botId: string,
  messages: Message[]
): Promise<void> => {
  // Only save if we have a valid userId (should be a VIP user)
  if (!userId || messages.length === 0) {
    console.log('Not saving chat history: invalid user ID or no messages');
    return;
  }
  
  try {
    // Create a conversation ID from user and bot IDs
    const conversationId = `${userId}_${botId}`;
    const conversationRef = doc(db, CHAT_HISTORY_COLLECTION, conversationId);
    
    // Prepare messages for Firestore
    const messagesToSave = messages.map(msg => ({
      ...msg,
      // Convert JS Date to Firestore Timestamp
      timestamp: Timestamp.fromDate(msg.timestamp),
      // Add expiry time for TTL (8 hours from now)
      expiresAt: Timestamp.fromDate(new Date(Date.now() + MESSAGE_TTL_HOURS * 60 * 60 * 1000))
    }));
    
    // Save to Firestore
    await setDoc(conversationRef, {
      userId,
      botId,
      lastUpdated: Timestamp.now(),
      messages: messagesToSave
    });
    
    console.log(`Saved chat history for conversation: ${conversationId}`);
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
};

/**
 * Retrieve chat history for a specific conversation
 * @param userId The user ID
 * @param botId The bot ID
 * @returns Promise with array of messages or empty array if not found
 */
export const getChatHistory = async (
  userId: string,
  botId: string
): Promise<Message[]> => {
  if (!userId || !botId) {
    console.log('Cannot retrieve chat history: invalid user or bot ID');
    return [];
  }
  
  try {
    const conversationId = `${userId}_${botId}`;
    const conversationRef = doc(db, CHAT_HISTORY_COLLECTION, conversationId);
    const conversationSnap = await getDoc(conversationRef);
    
    if (conversationSnap.exists()) {
      const data = conversationSnap.data();
      
      // Convert Firestore Timestamps back to JS Dates
      const messages = data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp.toDate()
      }));
      
      return messages;
    }
    
    return [];
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    return [];
  }
};

/**
 * Get all chat histories for a user
 * @param userId The user ID
 * @returns Promise with a map of botId -> messages
 */
export const getAllChatHistories = async (
  userId: string
): Promise<Record<string, Message[]>> => {
  if (!userId) {
    console.log('Cannot retrieve chat histories: invalid user ID');
    return {};
  }
  
  try {
    const q = query(
      collection(db, CHAT_HISTORY_COLLECTION),
      where('userId', '==', userId),
      orderBy('lastUpdated', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const chatHistories: Record<string, Message[]> = {};
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const botId = data.botId;
      
      // Convert Firestore Timestamps back to JS Dates
      const messages = data.messages.map((msg: any) => ({
        ...msg,
        timestamp: msg.timestamp.toDate()
      }));
      
      chatHistories[botId] = messages;
    });
    
    return chatHistories;
  } catch (error) {
    console.error('Error retrieving all chat histories:', error);
    return {};
  }
};

/**
 * Delete a specific chat history
 * @param userId The user ID
 * @param botId The bot ID
 * @returns Promise that resolves when deletion is complete
 */
export const deleteChatHistory = async (
  userId: string,
  botId: string
): Promise<void> => {
  if (!userId || !botId) {
    console.log('Cannot delete chat history: invalid user or bot ID');
    return;
  }
  
  try {
    const conversationId = `${userId}_${botId}`;
    const conversationRef = doc(db, CHAT_HISTORY_COLLECTION, conversationId);
    
    await deleteDoc(conversationRef);
    console.log(`Deleted chat history for conversation: ${conversationId}`);
  } catch (error) {
    console.error('Error deleting chat history:', error);
  }
};

/**
 * Delete all chat histories for a user
 * @param userId The user ID
 * @returns Promise that resolves when all deletions are complete
 */
export const deleteAllChatHistories = async (userId: string): Promise<void> => {
  if (!userId) {
    console.log('Cannot delete chat histories: invalid user ID');
    return;
  }
  
  try {
    const q = query(
      collection(db, CHAT_HISTORY_COLLECTION),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);
    
    querySnapshot.forEach((document) => {
      batch.delete(document.ref);
    });
    
    await batch.commit();
    console.log(`Deleted all chat histories for user: ${userId}`);
  } catch (error) {
    console.error('Error deleting all chat histories:', error);
  }
};
