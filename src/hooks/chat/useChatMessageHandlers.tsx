
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
      senderId: 'user',
      senderName: 'You',
      receiverId: currentBotId,
      text: text,
      content: text, // Add for compatibility with both interfaces
      sender: 'user', // Add for compatibility with both interfaces
      timestamp: new Date(),
      status: 'sending',
      isRead: false
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
      senderId: 'user',
      senderName: 'You',
      receiverId: currentBotId,
      text: 'Image',
      content: imageDataUrl, // Add for compatibility with both interfaces
      sender: 'user', // Add for compatibility with both interfaces
      timestamp: new Date(),
      status: 'sending',
      isRead: false,
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
      senderId: 'user',
      senderName: 'You',
      receiverId: currentBotId,
      text: 'Voice message',
      content: voiceDataUrl, // Add for compatibility with both interfaces
      sender: 'user', // Add for compatibility with both interfaces
      timestamp: new Date(),
      status: 'sending',
      isRead: false,
      isVoice: true,
      voiceDuration: duration,
      duration: duration // Add for compatibility with both interfaces
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
