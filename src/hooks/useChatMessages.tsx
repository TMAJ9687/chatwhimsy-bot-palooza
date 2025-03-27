
import { useState, useCallback, useRef } from 'react';
import { Message, Bot } from '@/types/chat';
import { getRandomBotResponse } from '@/utils/botUtils';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';

export const useChatMessages = (isVip: boolean, onNewNotification: (botId: string, content: string, botName: string) => void) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const currentBotIdRef = useRef<string>('');

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
  }, [userChats]);

  const simulateBotResponse = useCallback((messageId: string, botId: string) => {
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

    if (isVip) {
      setTimeout(() => updateMessageStatus('sent'), 500);
      setTimeout(() => updateMessageStatus('delivered'), 1000);
    }
    
    setTimeout(() => {
      const isCurrent = currentBotIdRef.current === botId;
      
      setTypingBots(prev => ({
        ...prev,
        [botId]: false
      }));
      
      setUserChats(prev => {
        const botMessages = [...(prev[botId] || [])];
        
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
        
        if (!isCurrent) {
          onNewNotification(botId, botResponse.content, 'Bot');
        }
        
        return {
          ...prev,
          [botId]: [
            ...updatedMessages,
            botResponse
          ]
        };
      });
    }, 3000);
  }, [isVip, onNewNotification]);

  const handleSendTextMessage = useCallback((text: string, currentBotId: string, botName: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: text,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));

    return newMessage.id;
  }, [userChats]);

  const handleSendImageMessage = useCallback(async (imageDataUrl: string, currentBotId: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: imageDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage: true,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    // Only track image uploads for non-VIP users
    if (!isVip) {
      try {
        const remaining = await trackImageUpload();
        setImagesRemaining(remaining);
      } catch (error) {
        console.error('Error tracking image upload:', error);
      }
    }
    
    return newMessage.id;
  }, [userChats, isVip]);

  const handleSendVoiceMessage = useCallback(async (audioDataUrl: string, currentBotId: string, blobSize?: number) => {
    if (!isVip) return '';
    
    const currentMessages = userChats[currentBotId] || [];
    
    // Calculate duration based on blob size (approximate)
    const approximateDuration = blobSize ? Math.round(blobSize / 16000) : 10; // Rough estimate
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: audioDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isVoice: true,
      duration: approximateDuration,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    return newMessage.id;
  }, [userChats, isVip]);

  const handleDeleteConversation = useCallback(() => {
    const currentBotId = currentBotIdRef.current;
    
    if (currentBotId) {
      setUserChats(prev => {
        const newChats = { ...prev };
        
        // Create a new conversation with just a system message
        newChats[currentBotId] = [{
          id: `system-${Date.now()}`,
          content: `Conversation cleared`,
          sender: 'system',
          timestamp: new Date(),
        }];
        
        return newChats;
      });
    }
  }, []);

  const initializeImageRemaining = useCallback(async () => {
    // VIP users have unlimited image uploads
    if (isVip) {
      setImagesRemaining(Infinity);
      return;
    }
    
    try {
      const remaining = await getRemainingUploads(false);
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error fetching remaining uploads:', error);
    }
  }, [isVip]);

  return {
    userChats,
    typingBots,
    imagesRemaining,
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    handleDeleteConversation,
    initializeImageRemaining
  };
};
