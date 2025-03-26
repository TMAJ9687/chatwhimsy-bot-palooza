
import { useState, useCallback, useRef } from 'react';
import { Message, Bot } from '@/types/chat';
import { getRandomBotResponse } from '@/utils/botUtils';
import { 
  trackImageUpload, 
  getRemainingUploads, 
  IMAGE_UPLOAD_LIMIT 
} from '@/utils/imageUploadLimiter';

const VOICE_MESSAGE_LIMIT = 5; // Standard users can send 5 voice messages per day

export const useChatMessages = (isVip: boolean, onNewNotification: (botId: string, content: string, botName: string) => void) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const [voiceMessagesRemaining, setVoiceMessagesRemaining] = useState(VOICE_MESSAGE_LIMIT);
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

  const handleSendVoiceMessage = useCallback(async (audioBlob: Blob, currentBotId: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    // Convert blob to data URL
    const audioUrl = URL.createObjectURL(audioBlob);
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: audioUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isVoiceMessage: true,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    // Only decrement voice messages for non-VIP users
    if (!isVip) {
      setVoiceMessagesRemaining(prev => Math.max(0, prev - 1));
    }
    
    return newMessage.id;
  }, [userChats, isVip]);

  const handleSendGifMessage = useCallback(async (gifUrl: string, currentBotId: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: gifUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isImage: true,
      isGif: true,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    return newMessage.id;
  }, [userChats]);

  const handleDeleteConversation = useCallback((botId: string) => {
    setUserChats(prev => {
      const newChats = { ...prev };
      // Reset conversation for the bot
      newChats[botId] = [{
        id: `system-${Date.now()}`,
        content: `Conversation deleted`,
        sender: 'system',
        timestamp: new Date(),
      }];
      return newChats;
    });
  }, []);

  const initializeImageRemaining = useCallback(async () => {
    if (!isVip) {
      try {
        const remaining = await getRemainingUploads(false);
        setImagesRemaining(remaining);
      } catch (error) {
        console.error('Error fetching remaining uploads:', error);
      }
    } else {
      // VIP users have unlimited uploads
      setImagesRemaining(Infinity);
    }
  }, [isVip]);

  return {
    userChats,
    typingBots,
    imagesRemaining,
    voiceMessagesRemaining,
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    handleSendGifMessage,
    handleDeleteConversation,
    initializeImageRemaining
  };
};
