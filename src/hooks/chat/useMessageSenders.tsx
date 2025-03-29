
import { useCallback } from 'react';
import { Message, Notification } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';

export const useMessageSenders = (
  currentBot: { id: string, name: string },
  userChats: Record<string, Message[]>,
  isVip: boolean,
  replyingToMessage: Message | null,
  setReplyingToMessage: React.Dispatch<React.SetStateAction<Message | null>>,
  setUserChats: React.Dispatch<React.SetStateAction<Record<string, Message[]>>>,
  handleSendTextMessage: (text: string, botId: string, botName: string) => string,
  handleSendImageMessage: (imageDataUrl: string, botId: string) => Promise<string>,
  handleSendVoiceMessage: (voiceDataUrl: string, duration: number, botId: string) => string,
  simulateBotResponse: (messageId: string, botId: string) => void,
  addHistoryItem: (notification: Notification) => void
) => {
  const { toast } = useToast();

  // Send text message with reply handling
  const handleSendTextMessageWrapper = useCallback((text: string) => {
    // Store the reference to the reply message before creating the new message
    const tempReplyId = isVip && replyingToMessage?.id || null;
    
    const messageId = handleSendTextMessage(text, currentBot.id, currentBot.name);
    
    // If we have a message to reply to, update the new message with the replyTo property - VIP only
    if (tempReplyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        
        // Find the message we just created and update it
        const messageIndex = botMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          const updatedMessage = {
            ...botMessages[messageIndex],
            replyTo: tempReplyId
          };
          
          // Create a new messages array with the updated message
          const updatedMessages = [
            ...botMessages.slice(0, messageIndex),
            updatedMessage,
            ...botMessages.slice(messageIndex + 1)
          ];
          
          newChats[currentBot.id] = updatedMessages;
        }
        
        return newChats;
      });
      
      // Clear the replying state
      setReplyingToMessage(null);
    }
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Message to ${currentBot.name}`,
      message: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    
    simulateBotResponse(messageId, currentBot.id);
    
    return messageId;
  }, [currentBot.id, currentBot.name, handleSendTextMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats, setReplyingToMessage]);

  // Send image message with reply handling
  const handleSendImageMessageWrapper = useCallback(async (imageDataUrl: string) => {
    // Store the reference to the reply message before creating the new message
    const tempReplyId = isVip && replyingToMessage?.id || null;
    
    const messageId = await handleSendImageMessage(imageDataUrl, currentBot.id);
    
    // If we have a message to reply to, update the new message with the replyTo property - VIP only
    if (tempReplyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        
        // Find the message we just created and update it
        const messageIndex = botMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          const updatedMessage = {
            ...botMessages[messageIndex],
            replyTo: tempReplyId
          };
          
          // Create a new messages array with the updated message
          const updatedMessages = [
            ...botMessages.slice(0, messageIndex),
            updatedMessage,
            ...botMessages.slice(messageIndex + 1)
          ];
          
          newChats[currentBot.id] = updatedMessages;
        }
        
        return newChats;
      });
      
      // Clear the replying state
      setReplyingToMessage(null);
    }
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Image sent to ${currentBot.name}`,
      message: 'You sent an image',
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    
    simulateBotResponse(messageId, currentBot.id);
    
    return messageId;
  }, [currentBot.id, currentBot.name, handleSendImageMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats, setReplyingToMessage]);

  // Send voice message with reply handling - VIP only
  const handleSendVoiceMessageWrapper = useCallback((voiceDataUrl: string, duration: number) => {
    // Only VIP users can send voice messages
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Voice messages are only available for VIP users.",
        duration: 3000
      });
      return "";
    }
    
    // Store the reference to the reply message before creating the new message - VIP only
    const tempReplyId = isVip && replyingToMessage?.id || null;
    
    const messageId = handleSendVoiceMessage(voiceDataUrl, duration, currentBot.id);
    
    // If we have a message to reply to, update the new message with the replyTo property
    if (tempReplyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        
        // Find the message we just created and update it
        const messageIndex = botMessages.findIndex(msg => msg.id === messageId);
        if (messageIndex >= 0) {
          const updatedMessage = {
            ...botMessages[messageIndex],
            replyTo: tempReplyId
          };
          
          // Create a new messages array with the updated message
          const updatedMessages = [
            ...botMessages.slice(0, messageIndex),
            updatedMessage,
            ...botMessages.slice(messageIndex + 1)
          ];
          
          newChats[currentBot.id] = updatedMessages;
        }
        
        return newChats;
      });
      
      // Clear the replying state
      setReplyingToMessage(null);
    }
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Voice message sent to ${currentBot.name}`,
      message: `You sent a ${Math.ceil(duration)}s voice message`,
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    
    simulateBotResponse(messageId, currentBot.id);
    
    return messageId;
  }, [currentBot.id, currentBot.name, handleSendVoiceMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats, setReplyingToMessage, toast]);

  return {
    handleSendTextMessageWrapper,
    handleSendImageMessageWrapper,
    handleSendVoiceMessageWrapper
  };
};
