
import React, { createContext, useContext } from 'react';
import { useAuth } from './FirebaseAuthContext';
import { useUser } from './UserContext';
import { Bot } from './chat/useChatState';
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
  
  // Get actions and create the context value
  const actions = useChatActions({
    currentUser,
    userIsVip,
    currentBot: state.currentBot,
    filteredUsers: state.filteredUsers,
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
