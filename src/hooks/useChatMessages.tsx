
import { useState, useCallback, useRef } from 'react';
import { Message } from '@/types/chat';
import { useMessageHandling } from './chat/useMessageHandling';
import { useBotResponses } from './chat/useBotResponses';

export const useChatMessages = (isVip: boolean, onNewNotification: (botId: string, content: string, botName: string) => void) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const currentBotIdRef = useRef<string>('');
  
  const {
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining,
    imagesRemaining
  } = useMessageHandling(userChats, setUserChats, isVip);
  
  const {
    typingBots,
    simulateBotResponse
  } = useBotResponses(userChats, setUserChats, currentBotIdRef, onNewNotification, isVip);
  
  const setCurrentBotId = useCallback((botId: string) => {
    currentBotIdRef.current = botId;
  }, []);

  const initializeChat = useCallback((botId: string, botName: string) => {
    if (!userChats[botId]) {
      setUserChats(prev => ({
        ...prev,
        [botId]: [{
          id: `system-${Date.now()}`,
          content: `Start a conversation with ${botName}`,
          sender: 'system',
          timestamp: new Date(),
        }]
      }));
    }
  }, [userChats, setUserChats]);

  return {
    userChats,
    typingBots,
    imagesRemaining,
    setUserChats,
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining
  };
};
