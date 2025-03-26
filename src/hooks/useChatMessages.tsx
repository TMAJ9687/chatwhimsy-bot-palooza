import { useState, useCallback, useRef } from 'react';
import { Message, Bot, MessageStatus } from '@/types/chat';
import { getRandomBotResponse } from '@/utils/botUtils';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';
import { MAX_CHAR_LIMIT } from '@/utils/messageUtils';

const VOICE_MESSAGE_LIMIT = 5; // Default limit for non-VIP users

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
      setTimeout(() => updateMessageStatus('delivered'), 1500);
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
    
    // Apply character limit for non-VIP users
    let messageContent = text;
    if (!isVip && text.length > MAX_CHAR_LIMIT) {
      messageContent = text.substring(0, MAX_CHAR_LIMIT);
    }
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));

    return newMessage.id;
  }, [userChats, isVip]);

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
    const audioUrl = URL.createObjectURL(audioBlob);
    const currentMessages = userChats[currentBotId] || [];
    
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
    
    // Decrease voice message count for non-VIP users
    if (!isVip) {
      setVoiceMessagesRemaining(prev => Math.max(0, prev - 1));
    }
    
    return newMessage.id;
  }, [userChats, isVip]);

  const handleReplyToMessage = useCallback((message: Message, replyText: string, currentBotId: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    // Apply character limit for non-VIP users
    let messageContent = replyText;
    if (!isVip && replyText.length > MAX_CHAR_LIMIT) {
      messageContent = replyText.substring(0, MAX_CHAR_LIMIT);
    }
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: messageContent,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      replyToId: message.id,
      replyToContent: message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
      replyToSender: message.sender === 'system' ? 'bot' : message.sender,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));

    return newMessage.id;
  }, [userChats, isVip]);

  const handleUnsendMessage = useCallback((messageId: string, currentBotId: string) => {
    setUserChats(prev => {
      const botMessages = [...(prev[currentBotId] || [])];
      
      // Filter out the unsent message
      const updatedMessages = botMessages.filter(msg => msg.id !== messageId);
      
      return {
        ...prev,
        [currentBotId]: updatedMessages
      };
    });
  }, []);

  const handleDeleteConversation = useCallback((botId: string) => {
    setUserChats(prev => {
      const newChats = { ...prev };
      delete newChats[botId];
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
      // VIP users have unlimited images
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
    handleReplyToMessage,
    handleUnsendMessage,
    handleDeleteConversation,
    initializeImageRemaining
  };
};
