
import { useCallback } from 'react';
import { getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';

export const useChatInitializer = (
  userChats: Record<string, any[]>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, any[]>>>,
  setImagesRemaining: React.Dispatch<React.SetStateAction<number>>,
  loadChatHistory: (botId: string, setUserChats: React.Dispatch<React.SetStateAction<Record<string, any[]>>>) => Promise<void>,
  isVip: boolean
) => {
  const initializeChat = useCallback(async (botId: string, botName: string) => {
    // Check if chat already exists
    if (!userChats[botId]) {
      // First create a basic chat
      setUserChats(prev => ({
        ...prev,
        [botId]: [{
          id: `system-${Date.now()}`,
          content: `Start a conversation with ${botName}`,
          sender: 'system',
          timestamp: new Date(),
        }]
      }));
      
      // Then try to load history for VIP users
      if (isVip) {
        await loadChatHistory(botId, setUserChats);
      }
    }
  }, [userChats, loadChatHistory, isVip, setUserChats]);

  const initializeImageRemaining = useCallback(async () => {
    try {
      // Get remaining uploads, passing isVip to properly handle unlimited uploads
      const remaining = await getRemainingUploads(isVip);
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error fetching remaining uploads:', error);
    }
  }, [isVip, setImagesRemaining]);

  return {
    initializeChat,
    initializeImageRemaining
  };
};
