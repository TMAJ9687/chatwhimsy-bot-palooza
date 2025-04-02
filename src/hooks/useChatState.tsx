
import { useCallback, useEffect, useState } from 'react';
import { Bot, Message, Notification } from '@/types/chat';
import { useChatInitialization } from './useChatInitialization';
import { useUserBlocking } from './useUserBlocking';
import { useNotifications } from './useNotifications';
import { useChatMessages } from './useChatMessages';
import { useBotFiltering } from './useBotFiltering';
import { useVipFeatures } from './useVipFeatures';
import { useToast } from './use-toast';
import { debounce } from '@/utils/performanceMonitor';

interface Translation {
  language: string;
  content: string;
}

export const useChatState = (isVip: boolean) => {
  // Only allow replying to messages for VIP users
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  
  const {
    currentBot,
    onlineUsers,
    rulesAccepted,
    setRulesAccepted,
    selectUser
  } = useChatInitialization();
  
  const { 
    blockedUsers,
    isUserBlocked,
    handleBlockUser: blockUser,
    handleUnblockUser 
  } = useUserBlocking();

  const {
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    unreadCount,
    setShowInbox,
    setShowHistory,
    handleNotificationRead,
    addNotification,
    addHistoryItem
  } = useNotifications();

  const { toast } = useToast();

  // Only allow VIP users to bypass rules
  const { shouldBypassRules } = useVipFeatures();

  useEffect(() => {
    if (isVip && shouldBypassRules() && !rulesAccepted) {
      setRulesAccepted(true);
    }
  }, [shouldBypassRules, rulesAccepted, setRulesAccepted, isVip]);

  const handleNewNotification = useCallback((botId: string, content: string, botName: string) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `New message from ${botName}`,
      message: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      time: new Date(),
      read: false,
      botId: botId
    };
    
    addNotification(newNotification);
  }, [addNotification]);

  const {
    userChats,
    typingBots,
    imagesRemaining,
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    initializeImageRemaining,
    setUserChats
  } = useChatMessages(isVip, handleNewNotification);

  // Create a debounced version of setUserChats for better performance
  const debouncedSetUserChats = useCallback(
    debounce((newChats: typeof userChats) => {
      setUserChats(newChats);
    }, 100),
    [setUserChats]
  );

  const {
    searchTerm,
    filters,
    filteredUsers,
    visibleUsers,
    setSearchTerm,
    setFilters,
    handleFilterChange
  } = useBotFiltering(onlineUsers, blockedUsers);

  useEffect(() => {
    setCurrentBotId(currentBot.id);
  }, [currentBot.id, setCurrentBotId]);

  useEffect(() => {
    initializeChat(currentBot.id, currentBot.name);
  }, [currentBot.id, currentBot.name, initializeChat]);

  useEffect(() => {
    initializeImageRemaining();
  }, [initializeImageRemaining]);

  const handleOpenChatFromNotification = useCallback((botId: string) => {
    if (!botId) return;
    
    const botToOpen = onlineUsers.find(user => user.id === botId);
    if (botToOpen) {
      selectUser(botToOpen);
      initializeChat(botToOpen.id, botToOpen.name);
      
      setShowInbox(false);
      setShowHistory(false);
    }
  }, [onlineUsers, selectUser, initializeChat, setShowInbox, setShowHistory]);

  const handleBlockUser = useCallback((userId: string) => {
    blockUser(userId);
    
    if (userId === currentBot.id && filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== userId && !blockedUsers.has(user.id));
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, blockedUsers, blockUser, selectUser]);

  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, selectUser]);

  // Updated send text message with proper reply handling - ensure only VIP can reply
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

  // Updated send image message with proper reply handling - ensure only VIP can reply
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

  // Updated send voice message with proper reply handling - ensure only VIP can send voice messages and reply
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

  const selectUserWithChat = useCallback((user: Bot) => {
    if (user.id !== currentBot.id) {
      selectUser(user);
      initializeChat(user.id, user.name);
    }
  }, [currentBot.id, selectUser, initializeChat]);

  const handleDeleteConversation = useCallback((userId: string) => {
    if (!userChats[userId]) return;
    
    setUserChats(prev => {
      const newChats = { ...prev };
      delete newChats[userId];
      return newChats;
    });
    
    toast({
      title: "Conversation deleted",
      description: `Your conversation has been deleted.`,
    });
    
    if (userId === currentBot.id) {
      initializeChat(currentBot.id, currentBot.name);
    }
  }, [userChats, currentBot.id, currentBot.name, initializeChat, toast, setUserChats]);

  // Only allow translation for VIP users
  const handleTranslateMessage = useCallback((messageId: string, targetLanguage: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Message translation is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    const translateText = (text: string, language: string): string => {
      const mockTranslations: Record<string, Record<string, string>> = {
        en: {
          "Hello!": "Hello!",
          "How are you?": "How are you?",
          "I'm good": "I'm good",
        },
        es: {
          "Hello!": "¡Hola!",
          "How are you?": "¿Cómo estás?",
          "I'm good": "Estoy bien",
        },
        fr: {
          "Hello!": "Bonjour!",
          "How are you?": "Comment ça va?",
          "I'm good": "Je vais bien",
        },
        de: {
          "Hello!": "Hallo!",
          "How are you?": "Wie geht es dir?",
          "I'm good": "Mir geht es gut",
        }
      };
      
      if (mockTranslations[language] && mockTranslations[language][text]) {
        return mockTranslations[language][text];
      }
      
      return `[${language.toUpperCase()}] ${text}`;
    };
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let translatedMessage = false;
      
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            if (msg.isImage || msg.isVoice) return msg;
            
            translatedMessage = true;
            const newTranslation: Translation = {
              language: targetLanguage,
              content: translateText(msg.content, targetLanguage)
            };
            
            return {
              ...msg,
              translations: [newTranslation]
            };
          }
          return msg;
        });
      });
      
      return newChats;
    });
    
    toast({
      title: "Message translated",
      description: `Message has been translated to ${targetLanguage.toUpperCase()}.`,
      duration: 3000
    });
  }, [setUserChats, toast, isVip]);

  const getSharedMedia = useCallback((userId: string) => {
    const chatMessages = userChats[userId] || [];
    
    const images = chatMessages.filter(msg => msg.isImage);
    const voice = chatMessages.filter(msg => msg.isVoice);
    
    return { images, voice };
  }, [userChats]);

  // Updated reply to message handler - VIP only
  const handleReplyToMessage = useCallback((messageId: string, content: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Replying to messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    // Find the message to reply to across all chats
    let messageToReplyTo: Message | null = null;
    
    Object.keys(userChats).forEach(botId => {
      const foundMessage = userChats[botId].find(msg => msg.id === messageId);
      if (foundMessage) {
        messageToReplyTo = foundMessage;
      }
    });
    
    if (!messageToReplyTo) return;
    
    // Set the message we're replying to
    setReplyingToMessage(messageToReplyTo);
    
    // If content is provided, immediately send the reply
    if (content) {
      return handleSendTextMessageWrapper(content);
    }
  }, [isVip, userChats, setReplyingToMessage, handleSendTextMessageWrapper, toast]);

  // Updated react to message handler - VIP only
  const handleReactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Reacting to messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let updated = false;
      
      // Look for the message across all chats
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            updated = true;
            // Create a new array of reactions to avoid mutating the original
            const existingReactions = [...(msg.reactions || [])];
            
            // Check if this emoji is already used by the user
            const existingReactionIndex = existingReactions.findIndex(
              r => r.userId === 'user' && r.emoji === emoji
            );
            
            let newReactions;
            
            // If the emoji is already used, remove it (toggle behavior)
            if (existingReactionIndex >= 0) {
              newReactions = [
                ...existingReactions.slice(0, existingReactionIndex),
                ...existingReactions.slice(existingReactionIndex + 1)
              ];
            } else {
              // Otherwise, add the new reaction
              newReactions = [...existingReactions, { emoji, userId: 'user' }];
            }
            
            // Return a new message object with the updated reactions
            return {
              ...msg,
              reactions: newReactions
            };
          }
          return msg;
        });
      });
      
      // Only show the toast if we actually updated a message
      if (updated) {
        toast({
          title: "Reaction updated",
          description: `You reacted with ${emoji}`,
          duration: 2000
        });
      }
      
      return newChats;
    });
  }, [isVip, setUserChats, toast]);

  // Updated unsend message handler - VIP only
  const handleUnsendMessage = useCallback((messageId: string) => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Unsending messages is only available for VIP users.",
        duration: 3000
      });
      return;
    }
    
    setUserChats(prev => {
      const newChats = { ...prev };
      let messageFound = false;
      
      // Look for the message across all chats
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          // Only allow unsending user messages
          if (msg.id === messageId && msg.sender === 'user') {
            messageFound = true;
            // Mark the message as deleted by setting isDeleted to true
            return { ...msg, isDeleted: true };
          }
          return msg;
        });
      });
      
      // Only show toast if we found and unsent a message
      if (messageFound) {
        toast({
          title: "Message unsent",
          description: "Your message has been unsent",
          duration: 3000
        });
      }
      
      return newChats;
    });
  }, [isVip, setUserChats, toast]);

  return {
    userChats,
    imagesRemaining,
    typingBots,
    currentBot,
    onlineUsers,
    blockedUsers,
    searchTerm,
    filters,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
    filteredUsers,
    unreadCount,
    isVip,
    setSearchTerm,
    setFilters,
    setShowInbox,
    setShowHistory,
    setRulesAccepted,
    handleBlockUser,
    handleUnblockUser,
    handleCloseChat,
    handleSendTextMessage: handleSendTextMessageWrapper,
    handleSendImageMessage: handleSendImageMessageWrapper,
    handleSendVoiceMessage: handleSendVoiceMessageWrapper,
    selectUser: selectUserWithChat,
    handleFilterChange,
    handleNotificationRead,
    handleOpenChatFromNotification,
    isUserBlocked,
    handleDeleteConversation,
    handleTranslateMessage,
    getSharedMedia,
    handleReplyToMessage,
    handleReactToMessage,
    handleUnsendMessage,
    replyingToMessage,
    setReplyingToMessage
  };
};
