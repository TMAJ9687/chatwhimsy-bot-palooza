
import { useCallback } from 'react';
import { getChatHistory } from '@/firebase/firestore/chatHistory';
import { toast } from '@/components/ui/use-toast';

export const useChatHistoryLoader = (
  isVip: boolean,
  userId: string | undefined,
  chatHistoryLoadedRef: React.MutableRefObject<Set<string>>
) => {
  const loadChatHistory = useCallback(async (
    botId: string,
    setUserChats: React.Dispatch<React.SetStateAction<Record<string, any[]>>>
  ) => {
    // Only load chat history for VIP users
    if (!isVip || !userId || chatHistoryLoadedRef.current.has(botId)) return;
    
    try {
      console.log(`Loading chat history for bot ${botId}...`);
      
      const messages = await getChatHistory(userId, botId);
      
      if (messages.length > 0) {
        console.log(`Loaded ${messages.length} messages for bot ${botId}`);
        
        setUserChats(prev => ({
          ...prev,
          [botId]: messages
        }));
      }
      
      // Mark as loaded to prevent multiple loads
      chatHistoryLoadedRef.current.add(botId);
    } catch (error) {
      console.error(`Error loading chat history for bot ${botId}:`, error);
      toast({
        title: "Load Error",
        description: "Could not load your chat history. Please try again later.",
        variant: "destructive"
      });
    }
  }, [isVip, userId, chatHistoryLoadedRef]);

  return {
    loadChatHistory
  };
};
