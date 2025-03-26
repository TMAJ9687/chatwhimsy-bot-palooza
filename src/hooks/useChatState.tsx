
import { useCallback, useEffect } from 'react';
import { Bot, Message, Notification } from '@/types/chat';
import { useChatInitialization } from './useChatInitialization';
import { useUserBlocking } from './useUserBlocking';
import { useNotifications } from './useNotifications';
import { useChatMessages } from './useChatMessages';
import { useBotFiltering } from './useBotFiltering';

export const useChatState = (isVip: boolean) => {
  // Initialize chat-related state from custom hooks
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

  // Create a handler for new notifications
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

  // Update the current bot ID reference when it changes
  useEffect(() => {
    setCurrentBotId(currentBot.id);
  }, [currentBot.id, setCurrentBotId]);

  // Initialize chat for current bot
  useEffect(() => {
    initializeChat(currentBot.id, currentBot.name);
  }, [currentBot.id, currentBot.name, initializeChat]);

  useEffect(() => {
    initializeImageRemaining();
  }, [initializeImageRemaining]);

  // If the user is VIP, mark rules as accepted automatically
  useEffect(() => {
    if (isVip && !rulesAccepted) {
      setRulesAccepted(true);
    }
  }, [isVip, rulesAccepted, setRulesAccepted]);

  // Handle blocking a user
  const handleBlockUser = useCallback((userId: string) => {
    blockUser(userId);
    
    // If the blocked user is current, select a different one
    if (userId === currentBot.id && filteredUsers.length > 1) {
      // Find the first visible user that isn't blocked
      const newUser = filteredUsers.find(user => user.id !== userId && !blockedUsers.has(user.id));
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, blockedUsers, blockUser, selectUser]);

  // Handle closing chat
  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, selectUser]);

  // Handle sending a text message
  const handleSendTextMessageWrapper = useCallback((text: string) => {
    const messageId = handleSendTextMessage(text, currentBot.id, currentBot.name);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Message to ${currentBot.name}`,
      message: text.slice(0, 30) + (text.length > 30 ? '...' : ''),
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    simulateBotResponse(messageId, currentBot.id);
  }, [currentBot.id, currentBot.name, handleSendTextMessage, addHistoryItem, simulateBotResponse]);

  // Handle sending an image message
  const handleSendImageMessageWrapper = useCallback(async (imageDataUrl: string) => {
    const messageId = await handleSendImageMessage(imageDataUrl, currentBot.id);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Image sent to ${currentBot.name}`,
      message: 'You sent an image',
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    simulateBotResponse(messageId, currentBot.id);
  }, [currentBot.id, currentBot.name, handleSendImageMessage, addHistoryItem, simulateBotResponse]);

  // Handle sending a voice message
  const handleSendVoiceMessageWrapper = useCallback(async (audioBlob: Blob) => {
    const messageId = await handleSendVoiceMessage(audioBlob, currentBot.id);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Voice message sent to ${currentBot.name}`,
      message: 'You sent a voice message',
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    simulateBotResponse(messageId, currentBot.id);
  }, [currentBot.id, currentBot.name, handleSendVoiceMessage, addHistoryItem, simulateBotResponse]);

  // Handle sending a GIF message
  const handleSendGifMessageWrapper = useCallback(async (gifUrl: string) => {
    const messageId = await handleSendGifMessage(gifUrl, currentBot.id);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `GIF sent to ${currentBot.name}`,
      message: 'You sent a GIF',
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
    simulateBotResponse(messageId, currentBot.id);
  }, [currentBot.id, currentBot.name, handleSendGifMessage, addHistoryItem, simulateBotResponse]);

  // Handle deleting a conversation
  const handleDeleteConversationWrapper = useCallback((botId: string) => {
    handleDeleteConversation(botId);
    
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: `Conversation with ${currentBot.name} deleted`,
      message: 'You deleted the conversation',
      time: new Date(),
      read: true
    };
    
    addHistoryItem(newNotification);
  }, [currentBot.name, handleDeleteConversation, addHistoryItem]);

  // Enhanced select user to init chat as well
  const selectUserWithChat = useCallback((user: Bot) => {
    if (user.id !== currentBot.id) {
      selectUser(user);
      initializeChat(user.id, user.name);
    }
  }, [currentBot.id, selectUser, initializeChat]);

  return {
    userChats,
    imagesRemaining,
    voiceMessagesRemaining,
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
    handleSendGifMessage: handleSendGifMessageWrapper,
    handleDeleteConversation: handleDeleteConversationWrapper,
    selectUser: selectUserWithChat,
    handleFilterChange,
    handleNotificationRead,
    isUserBlocked
  };
};
