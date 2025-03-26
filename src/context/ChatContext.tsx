
import React, { createContext, useState, useContext, useEffect, useCallback, useMemo, ReactNode } from 'react';
import { Bot, Message, Notification, FilterState } from '@/types/chat';
import { ChatContextType } from '@/types/chatContext';
import { useUser } from './UserContext';
import { botProfiles } from '@/data/botProfiles';
import { sortUsers } from '@/utils/botUtils';
import { useUserBlocking } from '@/hooks/useUserBlocking';
import { useNotifications } from '@/hooks/useNotifications';
import { useChatMessages } from '@/hooks/useChatMessages';
import { useBotFiltering } from '@/hooks/useBotFiltering';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get user info and VIP status from UserContext
  const { user, isVip: userIsVip } = useUser();
  
  // Make sure we always have a default bot
  const defaultBot = botProfiles[0];
  
  const [currentBot, setCurrentBot] = useState<Bot>(defaultBot);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [rulesAccepted, setRulesAccepted] = useState(false);
  const [userCountry, setUserCountry] = useState<string>('');
  
  // Use our custom hooks
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
    setCurrentBotId,
    initializeChat,
    simulateBotResponse,
    handleSendTextMessage,
    handleSendImageMessage,
    initializeImageRemaining
  } = useChatMessages(userIsVip || false, handleNewNotification);

  // Use the VIP status from UserContext
  const isVip = userIsVip || false;

  const sortedBotProfiles = useMemo(() => sortUsers(botProfiles), []);

  const {
    searchTerm,
    filters,
    filteredUsers,
    visibleUsers,
    setSearchTerm,
    setFilters,
    handleFilterChange
  } = useBotFiltering(sortedBotProfiles, blockedUsers);

  // Update the current bot ID reference when it changes
  useEffect(() => {
    setCurrentBotId(currentBot.id);
  }, [currentBot.id, setCurrentBotId]);

  // Initialize chat for current bot
  useEffect(() => {
    initializeChat(currentBot.id, currentBot.name);
  }, [currentBot.id, currentBot.name, initializeChat]);

  // Fetch user country on mount
  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const response = await fetch('https://api.ipgeolocation.io/ipgeo?apiKey=API_KEY_HERE');
        if (!response.ok) {
          const fallbackResponse = await fetch('https://ipapi.co/json/');
          const data = await fallbackResponse.json();
          setUserCountry(data.country_name || '');
        } else {
          const data = await response.json();
          setUserCountry(data.country_name || '');
        }
      } catch (error) {
        console.error('Error fetching user country:', error);
        try {
          const fallbackResponse = await fetch('https://ipapi.co/json/');
          const data = await fallbackResponse.json();
          setUserCountry(data.country_name || '');
        } catch (fallbackError) {
          console.error('Error with fallback country fetch:', fallbackError);
        }
      }
    };

    fetchUserCountry();
    initializeImageRemaining();
  }, [initializeImageRemaining]);

  // Update sorted users when user country changes
  useEffect(() => {
    if (userCountry) {
      console.log('Sorting users based on country:', userCountry);
      const sortedUsers = sortUsers(botProfiles);
      setOnlineUsers(new Set(sortedUsers.map(bot => bot.id)));
    }
  }, [userCountry]);

  // Handle blocking a user
  const handleBlockUser = useCallback((userId: string) => {
    blockUser(userId);
    
    // If the blocked user is current, select a different one
    if (userId === currentBot.id && filteredUsers.length > 1) {
      // Find the first visible user that isn't blocked
      const newUser = filteredUsers.find(user => user.id !== userId && !blockedUsers.has(user.id));
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers, blockedUsers, blockUser]);

  // Handle closing chat
  const handleCloseChat = useCallback(() => {
    if (filteredUsers.length > 1) {
      const newUser = filteredUsers.find(user => user.id !== currentBot.id);
      if (newUser) selectUser(newUser);
    }
  }, [currentBot.id, filteredUsers]);

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

  // Select a user to chat with
  const selectUser = useCallback((user: Bot) => {
    if (user.id !== currentBot.id) {
      setCurrentBot(user);
      initializeChat(user.id, user.name);
    }
  }, [currentBot.id, initializeChat]);

  const contextValue: ChatContextType = {
    userChats,
    imagesRemaining,
    typingBots,
    currentBot,
    onlineUsers: sortedBotProfiles,
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
    selectUser,
    handleFilterChange,
    handleNotificationRead,
    isUserBlocked
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
