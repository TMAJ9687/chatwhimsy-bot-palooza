
import { useState, useCallback, useMemo, useEffect } from 'react';
import { Bot, Message, FilterState } from '@/types/chat';
import { useBotFiltering } from './useBotFiltering';
import { botProfiles } from '@/data/botProfiles';

export const useChatState = () => {
  const [userChats, setUserChats] = useState<Record<string, Message[]>>({});
  const [imagesRemaining, setImagesRemaining] = useState<number>(10);
  const [typingBots, setTypingBots] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Bot[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());
  const [unreadNotifications, setUnreadNotifications] = useState<any[]>([]);
  const [chatHistory, setChatHistory] = useState<any[]>([]);
  const [showInbox, setShowInbox] = useState<boolean>(false);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [replyingToMessage, setReplyingToMessage] = useState<Message | null>(null);
  
  const [bots, setBots] = useState<Bot[]>(botProfiles);
  const [currentBot, setCurrentBot] = useState<Bot | null>(null);
  
  // Use the bot filtering hook
  const {
    filters,
    setFilters,
    searchTerm,
    setSearchTerm,
    filteredBots,
    handleFilterChange
  } = useBotFiltering(bots);

  const handleBlockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => new Set(prev).add(userId));
  }, []);

  const handleUnblockUser = useCallback((userId: string) => {
    setBlockedUsers(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }, []);

  const handleCloseChat = useCallback(() => {
    setCurrentBot(null);
  }, []);

  const handleSendTextMessage = useCallback((text: string) => {
    // Implementation for sending text message
  }, []);

  const handleSendImageMessage = useCallback((imageDataUrl: string) => {
    // Implementation for sending image message
  }, []);

  const handleSendVoiceMessage = useCallback((voiceDataUrl: string, duration: number) => {
    // Implementation for sending voice message
  }, []);
  
  // Select a bot to chat with
  const selectBot = useCallback((bot: Bot) => {
    setCurrentBot(bot);
    // Additional logic when selecting a bot can be added here
  }, []);

  const isUserBlocked = useCallback((userId: string): boolean => {
    return blockedUsers.has(userId);
  }, [blockedUsers]);

  // Return the chat state and functions
  return {
    userChats,
    imagesRemaining,
    typingBots,
    onlineUsers,
    blockedUsers,
    unreadNotifications,
    chatHistory,
    showInbox,
    showHistory,
    rulesAccepted,
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
    handleSendTextMessage,
    handleSendImageMessage,
    handleSendVoiceMessage,
    selectUser: selectBot,
    handleFilterChange,
    handleNotificationRead: () => {},
    isUserBlocked,
    handleDeleteConversation: () => {},
    handleTranslateMessage: () => {},
    getSharedMedia: () => ({ images: [], voice: [] }),
    handleReplyToMessage: () => {},
    handleReactToMessage: () => {},
    handleUnsendMessage: () => {},
    replyingToMessage,
    setReplyingToMessage,
    
    // Bot filtering
    filters,
    searchTerm,
    filteredUsers: filteredBots,
    visibleUsers: filteredBots,
    
    // Bot selection
    currentBot
  };
};
