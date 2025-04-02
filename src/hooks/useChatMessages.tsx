
import { useState, useCallback, useRef, useEffect } from 'react';
import { Message, Bot } from '@/types/chat';
import { getRandomBotResponse } from '@/utils/botUtils';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';
import { uploadDataURLImage } from '@/firebase/storage';
import { useUser } from '@/context/UserContext';

export const useChatMessages = (isVip: boolean, onNewNotification: (botId: string, content: string, botName: string) => void) => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const currentBotIdRef = useRef<string>('');
  const { user } = useUser();
  
  // Add a ref to prevent simulation running multiple times for the same message
  const processingMessageIds = useRef<Set<string>>(new Set());
  
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
    
    try {
      // Only track image uploads for non-VIP users
      const remaining = await trackImageUpload(isVip);
      setImagesRemaining(remaining);
      
      // Upload the image to Firebase Storage
      if (user?.id) {
        await uploadDataURLImage(imageDataUrl, isVip, user.id);
      }
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    return newMessage.id;
  }, [userChats, isVip, user?.id]);

  const handleSendVoiceMessage = useCallback((voiceDataUrl: string, duration: number, currentBotId: string) => {
    const currentMessages = userChats[currentBotId] || [];
    
    const newMessage: Message = {
      id: `user-${Date.now()}`,
      content: voiceDataUrl,
      sender: 'user',
      timestamp: new Date(),
      status: 'sending',
      isVoice: true,
      duration: duration,
    };
    
    setUserChats(prev => ({
      ...prev,
      [currentBotId]: [...currentMessages, newMessage]
    }));
    
    return newMessage.id;
  }, [userChats]);

  const initializeImageRemaining = useCallback(async () => {
    try {
      // Get remaining uploads, passing isVip to properly handle unlimited uploads
      const remaining = await getRemainingUploads(isVip);
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error fetching remaining uploads:', error);
    }
  }, [isVip]);

  // Cleanup function to clear any hanging message processing on unmount
  useEffect(() => {
    return () => {
      processingMessageIds.current.clear();
    };
  }, []);

  return {
    userChats,
    typingBots,
    imagesRemaining,
    setUserChats, // Export this so it can be used in other hooks
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining
  };
};
