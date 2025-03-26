
import React, { createContext, useContext } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { useUser } from './UserContext';
import { useChatState } from './chat/useChatState';
import { useChatEffects } from './chat/useChatEffects';
import { useChatActions } from './chat/useChatActions';
import { createChatContextValue } from './chat/createChatContextValue';
import { ChatContextType } from './chat/types/ChatContextTypes';

// Export Message type from the components directory
export type { Message } from '@/components/chat/types/MessageTypes';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  
  // Safely access user context with error handling
  let userIsVip = false;
  let userImagesRemaining = 15; // Default value
  let user = null;

  try {
    const userContext = useUser();
    userIsVip = userContext.isVip;
    user = userContext.user;
    userImagesRemaining = user?.imagesRemaining;
  } catch (error) {
    console.error("Error accessing UserContext:", error);
    // Continue with default values if UserContext is not available
  }
  
  // Use our custom hooks to manage state, effects, and actions
  const state = useChatState(userIsVip, userImagesRemaining);
  
  // Calculate filtered users before passing to actions
  const filteredUsers = state.onlineUsers.filter(user => 
    !state.blockedUsers.includes(user.id) &&
    user.name.toLowerCase().includes(state.searchTerm.toLowerCase()) &&
    (state.filters.gender === 'any' || user.gender === state.filters.gender) &&
    (user.age >= state.filters.ageRange[0] && user.age <= state.filters.ageRange[1]) &&
    (state.filters.countries.length === 0 || state.filters.countries.includes(user.country))
  );
  
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
    userImagesRemaining
  });
  
  // Get actions and create the context value
  const actions = useChatActions({
    currentUser,
    userIsVip,
    currentBot: state.currentBot,
    filteredUsers, // Directly pass the calculated filteredUsers
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
  
  // Create the complete context value
  const contextValue = createChatContextValue(state, actions, userIsVip);

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
