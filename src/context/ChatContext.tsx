
import React, { createContext, useContext, useMemo } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { useUser } from './UserContext';
import { Message } from '@/components/chat/MessageBubble';
import { useChatState, Bot } from './chat/useChatState';
import { useChatEffects } from './chat/useChatEffects';
import { useChatActions } from './chat/useChatActions';
import { Notification } from '@/components/chat/NotificationSidebar';
import { FilterState } from '@/components/chat/FilterMenu';

interface ChatContextType {
  userChats: Record<string, Message[]>;
  imagesRemaining: number;
  typingBots: Record<string, boolean>;
  currentBot: Bot;
  onlineUsers: Bot[];
  searchTerm: string;
  filters: FilterState;
  unreadNotifications: Notification[];
  chatHistory: Notification[];
  showInbox: boolean;
  showHistory: boolean;
  rulesAccepted: boolean;
  filteredUsers: Bot[];
  unreadCount: number;
  isVip: boolean;
  setSearchTerm: (term: string) => void;
  setFilters: (filters: FilterState) => void;
  setShowInbox: (show: boolean) => void;
  setShowHistory: (show: boolean) => void;
  setRulesAccepted: (accepted: boolean) => void;
  handleBlockUser: () => void;
  handleCloseChat: () => void;
  handleSendTextMessage: (text: string) => void;
  handleSendImageMessage: (imageDataUrl: string) => void;
  selectUser: (user: Bot) => void;
  handleFilterChange: (newFilters: FilterState) => void;
  handleNotificationRead: (id: string) => void;
  reportCurrentUser: (reason: string, details?: string) => Promise<boolean>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { user, isVip: userIsVip } = useUser();
  
  // Use our custom hooks to manage state, effects, and actions
  const state = useChatState(userIsVip, user?.imagesRemaining);
  
  // Setup effects
  useChatEffects({
    currentUser,
    userIsVip,
    currentBot: state.currentBot,
    setUserChats: state.setUserChats,
    setImagesRemaining: state.setImagesRemaining,
    setBlockedUsers: state.setBlockedUsers,
    setOnlineUsers: state.setOnlineUsers,
    userCountry: state.userCountry,
    setUserCountry: state.setUserCountry,
    currentBotIdRef: state.currentBotIdRef,
    userImagesRemaining: user?.imagesRemaining
  });
  
  // Calculate filtered users
  const filteredUsers = useMemo(() => {
    let filtered = state.onlineUsers.filter(user => !state.blockedUsers.includes(user.id));
    
    filtered = filtered.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(state.searchTerm.toLowerCase());
      const matchesGender = state.filters.gender === 'any' || user.gender === state.filters.gender;
      const matchesAge = user.age >= state.filters.ageRange[0] && user.age <= state.filters.ageRange[1];
      const matchesCountry = state.filters.countries.length === 0 || 
        state.filters.countries.includes(user.country);
      return matchesSearch && matchesGender && matchesAge && matchesCountry;
    });
    
    return filtered;
  }, [state.onlineUsers, state.searchTerm, state.filters, state.blockedUsers]);
  
  // Setup actions
  const actions = useChatActions({
    currentUser,
    userIsVip,
    currentBot: state.currentBot,
    filteredUsers,
    userChats: state.userChats,
    setUserChats: state.setUserChats,
    setTypingBots: state.setTypingBots,
    setCurrentBot: state.setCurrentBot,
    setBlockedUsers: state.setBlockedUsers,
    setOnlineUsers: state.setOnlineUsers,
    setImagesRemaining: state.setImagesRemaining,
    setUnreadNotifications: state.setUnreadNotifications,
    setChatHistory: state.setChatHistory,
    currentBotIdRef: state.currentBotIdRef
  });
  
  // Additional properties
  const isVip = userIsVip || state.currentBot?.vip || false;
  const unreadCount = useMemo(() => 
    state.unreadNotifications.filter(n => !n.read).length, 
    [state.unreadNotifications]
  );

  // Compile the complete context value
  const contextValue = {
    userChats: state.userChats,
    imagesRemaining: state.imagesRemaining,
    typingBots: state.typingBots,
    currentBot: state.currentBot,
    onlineUsers: state.onlineUsers,
    searchTerm: state.searchTerm,
    filters: state.filters,
    unreadNotifications: state.unreadNotifications,
    chatHistory: state.chatHistory,
    showInbox: state.showInbox,
    showHistory: state.showHistory,
    rulesAccepted: state.rulesAccepted,
    filteredUsers,
    unreadCount,
    isVip,
    setSearchTerm: state.setSearchTerm,
    setFilters: state.setFilters,
    setShowInbox: state.setShowInbox,
    setShowHistory: state.setShowHistory,
    setRulesAccepted: state.setRulesAccepted,
    ...actions
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

export type { Message } from '@/components/chat/MessageBubble';
