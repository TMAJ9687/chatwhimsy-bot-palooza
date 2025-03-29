
import { useCallback, useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { useChatInitialization } from './useChatInitialization';
import { useUserBlocking } from './useUserBlocking';
import { useNotifications } from './useNotifications';
import { useChatMessages } from './useChatMessages';
import { useBotFiltering } from './useBotFiltering';
import { useVipFeatures } from './useVipFeatures';
import { debounce } from '@/utils/performanceMonitor';
import { useMessageActions } from './chat/useMessageActions';
import { useChatManagement } from './chat/useChatManagement';
import { useMessageSenders } from './chat/useMessageSenders';

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

  // Only allow VIP users to bypass rules
  const { shouldBypassRules } = useVipFeatures();

  useEffect(() => {
    if (isVip && shouldBypassRules() && !rulesAccepted) {
      setRulesAccepted(true);
    }
  }, [shouldBypassRules, rulesAccepted, setRulesAccepted, isVip]);

  const handleNewNotification = useCallback((botId: string, content: string, botName: string) => {
    const newNotification = {
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

  // Get senders for messages
  const { 
    handleSendTextMessageWrapper,
    handleSendImageMessageWrapper,
    handleSendVoiceMessageWrapper
  } = useMessageSenders(
    currentBot,
    userChats,
    isVip,
    replyingToMessage,
    setReplyingToMessage,
    setUserChats,
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    simulateBotResponse,
    addHistoryItem
  );

  // Get actions for message management
  const {
    handleTranslateMessage,
    handleReplyToMessage,
    handleReactToMessage,
    handleUnsendMessage
  } = useMessageActions(
    isVip, 
    setUserChats,
    setReplyingToMessage,
    handleSendTextMessageWrapper
  );

  // Get chat management functions
  const {
    handleCloseChat,
    selectUserWithChat,
    handleDeleteConversation,
    handleBlockUser,
    getSharedMedia
  } = useChatManagement(
    currentBot,
    filteredUsers,
    blockedUsers,
    setUserChats,
    selectUser,
    initializeChat
  );

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
    handleBlockUser: (userId: string) => handleBlockUser(userId, blockUser),
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
    getSharedMedia: (userId: string) => getSharedMedia(userId, userChats),
    handleReplyToMessage: (messageId: string, content: string) => 
      handleReplyToMessage(messageId, content, userChats),
    handleReactToMessage,
    handleUnsendMessage,
    replyingToMessage,
    setReplyingToMessage
  };
};
