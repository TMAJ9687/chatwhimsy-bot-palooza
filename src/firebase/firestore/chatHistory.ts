
// This file now redirects all chat history operations to Supabase
// It serves as a compatibility layer during migration

import { firebaseToSupabaseChatHistory } from '@/lib/compatibility/firebaseToSupabase';
import { Message } from '@/types/chat';

// Export all the functions using the Supabase implementation
export const saveChatHistory = firebaseToSupabaseChatHistory.saveChatHistory;
export const getChatHistory = firebaseToSupabaseChatHistory.getChatHistory;
export const getAllChatHistories = firebaseToSupabaseChatHistory.getAllChatHistories;
export const deleteChatHistory = firebaseToSupabaseChatHistory.deleteChatHistory;
export const deleteAllChatHistories = firebaseToSupabaseChatHistory.deleteAllChatHistories;
