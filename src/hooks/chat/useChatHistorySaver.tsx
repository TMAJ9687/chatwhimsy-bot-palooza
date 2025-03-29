
import { useCallback } from 'react';
import { Message } from '@/types/chat';
import { saveChatHistory } from '@/firebase/firestore';

export const useChatHistorySaver = (
  isVip: boolean,
  userId: string | undefined,
  userChats: Record<string, Message[]>,
  saveTimeoutRef: React.MutableRefObject<Record<string, NodeJS.Timeout | null>>
) => {
  const saveChatHistoryDebounced = useCallback((botId: string) => {
    // Only save chat history for VIP users
    if (!isVip || !userId) return;
    
    // Clear any existing timeout for this bot
    if (saveTimeoutRef.current[botId]) {
      clearTimeout(saveTimeoutRef.current[botId]!);
    }
    
    // Set a new timeout to save chat history
    saveTimeoutRef.current[botId] = setTimeout(() => {
      const messages = userChats[botId] || [];
      saveChatHistory(userId, botId, messages)
        .catch(err => console.error('Error saving chat history:', err));
      
      // Clear the timeout reference
      saveTimeoutRef.current[botId] = null;
    }, 1000); // 1 second debounce
  }, [isVip, userId, userChats, saveTimeoutRef]);

  return {
    saveChatHistoryDebounced
  };
};
