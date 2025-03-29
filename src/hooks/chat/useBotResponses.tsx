
import { useCallback } from 'react';
import { getRandomBotResponse } from '@/utils/botUtils';

export const useBotResponses = (
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, any[]>>>,
  setTypingBots: React.Dispatch<React.SetStateAction<Record<string, boolean>>>,
  currentBotIdRef: React.MutableRefObject<string>,
  isVip: boolean,
  userId: string | undefined,
  saveChatHistoryDebounced: (botId: string) => void
) => {
  const simulateBotResponse = useCallback((messageId: string, botId: string, onNewNotification: (botId: string, content: string, botName: string) => void) => {
    setTypingBots(prev => ({
      ...prev,
      [botId]: true
    }));

    const updateMessageStatus = (status: 'sending' | 'sent' | 'delivered' | 'read') => {
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        return {
          ...prev,
          [botId]: botMessages.map(msg => 
            msg.id === messageId ? { ...msg, status } : msg
          )
        };
      });
    };

    // Always update message status for all users
    setTimeout(() => updateMessageStatus('sent'), 500);
    setTimeout(() => updateMessageStatus('delivered'), 1500);
    
    setTimeout(() => {
      const isCurrent = currentBotIdRef.current === botId;
      
      setTypingBots(prev => ({
        ...prev,
        [botId]: false
      }));
      
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        
        // For VIP users, mark all user messages as read when bot responds
        const updatedMessages = isVip ? 
          botMessages.map(msg => 
            msg.sender === 'user' ? { ...msg, status: 'read' as const } : msg
          ) : botMessages;
        
        const botResponse = {
          id: `bot-${Date.now()}`,
          content: getRandomBotResponse(botId),
          sender: 'bot' as const,
          timestamp: new Date(),
        };
        
        // Find the botName to use in the notification
        let botName = 'Bot';
        // This assumes there's a system message in the chat with the bot name
        const systemMsg = botMessages.find(msg => msg.sender === 'system');
        if (systemMsg && systemMsg.content) {
          const match = systemMsg.content.match(/Start a conversation with (.+)/);
          if (match && match[1]) {
            botName = match[1];
          }
        }
        
        if (!isCurrent) {
          onNewNotification(botId, botResponse.content, botName);
        }
        
        const updatedChatMessages = [
          ...updatedMessages,
          botResponse
        ];
        
        // Save chat history for VIP users after bot response
        if (isVip && userId) {
          saveChatHistoryDebounced(botId);
        }
        
        return {
          ...prev,
          [botId]: updatedChatMessages
        };
      });
    }, 3000);
  }, [currentBotIdRef, isVip, setTypingBots, setUserChats, userId, saveChatHistoryDebounced]);

  return {
    simulateBotResponse
  };
};
