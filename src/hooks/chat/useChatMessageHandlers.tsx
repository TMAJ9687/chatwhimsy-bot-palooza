
import { useCallback } from 'react';
import { Message } from '@/types/chat';
import { uploadDataURLImage } from '@/firebase/storage';
import { trackImageUpload } from '@/utils/imageUploadLimiter';

export const useChatMessageHandlers = (
  userChats: Record<string, Message[]>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  setImagesRemaining: React.Dispatch<React.SetStateAction<number>>,
  isVip: boolean,
  userId: string | undefined,
  saveChatHistoryDebounced: (botId: string) => void
) => {
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
    
    // Save chat history for VIP users
    if (isVip && userId) {
      saveChatHistoryDebounced(currentBotId);
    }

    return newMessage.id;
  }, [userChats, isVip, userId, setUserChats, saveChatHistoryDebounced]);

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
      if (userId) {
        await uploadDataURLImage(imageDataUrl, isVip, userId);
      }
      
      // Save chat history for VIP users
      if (isVip && userId) {
        saveChatHistoryDebounced(currentBotId);
      }
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    return newMessage.id;
  }, [userChats, isVip, userId, setUserChats, setImagesRemaining, saveChatHistoryDebounced]);

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
    
    // Save chat history for VIP users
    if (isVip && userId) {
      saveChatHistoryDebounced(currentBotId);
    }
    
    return newMessage.id;
  }, [userChats, isVip, userId, setUserChats, saveChatHistoryDebounced]);

  return {
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage
  };
};
