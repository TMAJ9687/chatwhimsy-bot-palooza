
import { useCallback, useState } from 'react';
import { Message } from '@/types/chat';
import { useUser } from '@/context/UserContext';
import { trackImageUpload, getRemainingUploads, IMAGE_UPLOAD_LIMIT } from '@/utils/imageUploadLimiter';
import { uploadDataURLImage } from '@/utils/storageUtils';

export const useMessageHandling = (
  userChats: Record<string, Message[]>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  isVip: boolean
) => {
  const [imagesRemaining, setImagesRemaining] = useState(IMAGE_UPLOAD_LIMIT);
  const { user } = useUser();
  
  // Function to send text messages
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
  }, [userChats, setUserChats]);

  // Function to send image messages
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
      
      // Upload the image to Supabase Storage if user is logged in
      if (user?.id) {
        try {
          await uploadDataURLImage(imageDataUrl, isVip, user.id);
        } catch (error) {
          console.error('Error uploading to Supabase:', error);
        }
      }
    } catch (error) {
      console.error('Error tracking image upload:', error);
    }
    
    return newMessage.id;
  }, [userChats, setUserChats, isVip, user?.id]);

  // Function to send voice messages
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
  }, [userChats, setUserChats]);

  // Function to initialize remaining image uploads
  const initializeImageRemaining = useCallback(async () => {
    try {
      // Get remaining uploads, passing isVip to properly handle unlimited uploads
      const remaining = await getRemainingUploads(isVip);
      setImagesRemaining(remaining);
    } catch (error) {
      console.error('Error fetching remaining uploads:', error);
    }
  }, [isVip]);
  
  return {
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining,
    imagesRemaining
  };
};
