import { useCallback, useEffect, useState } from 'react';
import { Bot, Message, Notification } from '@/types/chat';
import { useChatInitialization } from './useChatInitialization';
import { useUserBlocking } from './useUserBlocking';
import { useNotifications } from './useNotifications';
import { useChatMessages } from './useChatMessages';
import { useBotFiltering } from './useBotFiltering';
import { useVipFeatures } from './useVipFeatures';
import { useToast } from './use-toast';

interface Translation {
  language: string;
  content: string;
}

export const useChatState = (isVip: boolean) => {
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

  const { shouldBypassRules } = useVipFeatures();

  useEffect(() => {
    if (shouldBypassRules() && !rulesAccepted) {
      setRulesAccepted(true);
    }
  }, [shouldBypassRules, rulesAccepted, setRulesAccepted]);

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

  const handleSendTextMessageWrapper = useCallback((text: string) => {
    const replyId = replyingToMessage?.id;
    const messageId = handleSendTextMessage(text, currentBot.id, currentBot.name);
    
    if (replyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        const updatedMessages = botMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, replyTo: replyId };
          }
          return msg;
        });
        newChats[currentBot.id] = updatedMessages;
        return newChats;
      });
      
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
  }, [currentBot.id, currentBot.name, handleSendTextMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats]);

  const handleSendImageMessageWrapper = useCallback(async (imageDataUrl: string) => {
    const replyId = replyingToMessage?.id;
    const messageId = await handleSendImageMessage(imageDataUrl, currentBot.id);
    
    if (replyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        const updatedMessages = botMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, replyTo: replyId };
          }
          return msg;
        });
        newChats[currentBot.id] = updatedMessages;
        return newChats;
      });
      
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
  }, [currentBot.id, currentBot.name, handleSendImageMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats]);

  const handleSendVoiceMessageWrapper = useCallback((voiceDataUrl: string, duration: number) => {
    const replyId = replyingToMessage?.id;
    const messageId = handleSendVoiceMessage(voiceDataUrl, duration, currentBot.id);
    
    if (replyId && isVip) {
      setUserChats(prev => {
        const newChats = { ...prev };
        const botMessages = [...(newChats[currentBot.id] || [])];
        const updatedMessages = botMessages.map(msg => {
          if (msg.id === messageId) {
            return { ...msg, replyTo: replyId };
          }
          return msg;
        });
        newChats[currentBot.id] = updatedMessages;
        return newChats;
      });
      
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
  }, [currentBot.id, currentBot.name, handleSendVoiceMessage, addHistoryItem, simulateBotResponse, replyingToMessage, isVip, setUserChats]);

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

  const handleTranslateMessage = useCallback((messageId: string, targetLanguage: string) => {
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
      
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            if (msg.isImage || msg.isVoice) return msg;
            
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
  }, [setUserChats]);

  const getSharedMedia = useCallback((userId: string) => {
    const chatMessages = userChats[userId] || [];
    
    const images = chatMessages.filter(msg => msg.isImage);
    const voice = chatMessages.filter(msg => msg.isVoice);
    
    return { images, voice };
  }, [userChats]);

  const handleReplyToMessage = useCallback((messageId: string, content: string) => {
    if (!isVip) return;
    
    const newMessageId = handleSendTextMessage(content, currentBot.id, currentBot.name);
    
    setUserChats(prev => {
      const newChats = { ...prev };
      const botMessages = [...(newChats[currentBot.id] || [])];
      const updatedMessages = botMessages.map(msg => {
        if (msg.id === newMessageId) {
          return { ...msg, replyTo: messageId };
        }
        return msg;
      });
      newChats[currentBot.id] = updatedMessages;
      return newChats;
    });
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Reply to message`,
      message: content.slice(0, 30) + (content.length > 30 ? '...' : ''),
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    simulateBotResponse(newMessageId, currentBot.id);
  }, [isVip, currentBot.id, currentBot.name, handleSendTextMessage, setUserChats, addHistoryItem, simulateBotResponse]);

  const handleReactToMessage = useCallback((messageId: string, emoji: string) => {
    if (!isVip) return;
    
    setUserChats(prev => {
      const newChats = { ...prev };
      
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId) {
            const existingReactions = msg.reactions || [];
            
            const existingReaction = existingReactions.find(
              r => r.userId === 'user' && r.emoji === emoji
            );
            
            if (existingReaction) {
              return {
                ...msg,
                reactions: existingReactions.filter(
                  r => !(r.userId === 'user' && r.emoji === emoji)
                )
              };
            }
            
            return {
              ...msg,
              reactions: [...existingReactions, { emoji, userId: 'user' }]
            };
          }
          return msg;
        });
      });
      
      return newChats;
    });
  }, [isVip, setUserChats]);

  const handleUnsendMessage = useCallback((messageId: string) => {
    if (!isVip) return;
    
    setUserChats(prev => {
      const newChats = { ...prev };
      
      Object.keys(newChats).forEach(botId => {
        newChats[botId] = newChats[botId].map(msg => {
          if (msg.id === messageId && msg.sender === 'user') {
            return { ...msg, isDeleted: true };
          }
          return msg;
        });
      });
      
      return newChats;
    });
    
    toast({
      title: "Message unsent",
      description: "Your message has been unsent",
      duration: 3000
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
