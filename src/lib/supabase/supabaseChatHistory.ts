
import { supabase } from './supabaseClient';
import { Message } from '@/types/chat';

/**
 * Save a chat conversation to Supabase
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
    
    // Convert messages to a format suitable for Supabase
    const messagesToSave = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender,
      timestamp: msg.timestamp.toISOString(),
      status: msg.status,
      isImage: msg.isImage || false,
      isVoice: msg.isVoice || false,
      duration: msg.duration,
      isDeleted: msg.isDeleted || false,
      replyTo: msg.replyTo
    }));
    
    // First check if this conversation exists
    const { data: existingConversation } = await supabase
      .from('chat_history')
      .select('id')
      .eq('id', conversationId)
      .single();
    
    if (existingConversation) {
      // Update existing conversation
      const { error } = await supabase
        .from('chat_history')
        .update({
          messages: messagesToSave,
          last_updated: new Date().toISOString()
        })
        .eq('id', conversationId);
      
      if (error) throw error;
    } else {
      // Create new conversation
      const { error } = await supabase
        .from('chat_history')
        .insert({
          id: conversationId,
          user_id: userId,
          bot_id: botId,
          messages: messagesToSave,
          last_updated: new Date().toISOString()
        });
      
      if (error) throw error;
    }
    
    console.log(`Saved chat history for conversation: ${conversationId}`);
  } catch (error) {
    console.error('Error saving chat history:', error);
    throw error;
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
    
    const { data, error } = await supabase
      .from('chat_history')
      .select('messages')
      .eq('id', conversationId)
      .maybeSingle();
    
    if (error) {
      console.error('Error retrieving chat history:', error);
      return [];
    }
    
    if (data && data.messages) {
      // Convert the stored messages back to Message objects
      return data.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
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
    const { data, error } = await supabase
      .from('chat_history')
      .select('bot_id, messages')
      .eq('user_id', userId)
      .order('last_updated', { ascending: false });
    
    if (error) {
      console.error('Error retrieving all chat histories:', error);
      return {};
    }
    
    const chatHistories: Record<string, Message[]> = {};
    
    data?.forEach((item) => {
      const botId = item.bot_id;
      // Convert stored messages to Message objects
      const messages = item.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
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
    
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('id', conversationId);
    
    if (error) throw error;
    
    console.log(`Deleted chat history for conversation: ${conversationId}`);
  } catch (error) {
    console.error('Error deleting chat history:', error);
    throw error;
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
    const { error } = await supabase
      .from('chat_history')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log(`Deleted all chat histories for user: ${userId}`);
  } catch (error) {
    console.error('Error deleting all chat histories:', error);
    throw error;
  }
};
