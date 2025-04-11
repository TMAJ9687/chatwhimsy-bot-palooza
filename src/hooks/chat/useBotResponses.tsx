
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/types/chat';
import { getRandomBotResponse } from '@/utils/botUtils';

export const useBotResponses = (
  userChats: Record<string, Message[]>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  currentBotIdRef: React.MutableRefObject<string>,
  onNewNotification: (botId: string, content: string, botName: string) => void,
  isVip: boolean
) => {
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  // Add a ref to prevent simulation running multiple times for the same message
  const processingMessageIds = useRef<Set<string>>(new Set());
  
  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
    // Prevent duplicate processing of the same message
    if (processingMessageIds.current.has(messageId)) {
      return;
    }
    
    // Mark this message as being processed
    processingMessageIds.current.add(messageId);
    
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
    
    const responseTimeout = setTimeout(() => {
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
        
        return {
          ...prev,
          [botId]: [
            ...updatedMessages,
            botResponse
          ]
        };
      });
      
      // Remove the message from processing after it's fully handled
      processingMessageIds.current.delete(messageId);
      
    }, 3000);
    
    // Cleanup function in case component unmounts during simulation
    return () => {
      clearTimeout(responseTimeout);
      processingMessageIds.current.delete(messageId);
    };
  }, [isVip, onNewNotification, setUserChats, currentBotIdRef]);

  // Cleanup function to clear any hanging message processing on unmount
  useEffect(() => {
    return () => {
      processingMessageIds.current.clear();
    };
  }, []);
  
  return {
    typingBots,
    simulateBotResponse
  };
};
