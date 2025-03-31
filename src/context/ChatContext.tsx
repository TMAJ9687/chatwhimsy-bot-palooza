
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { Bot, Message, FilterState, Notification } from '@/types/chat';
import { useChatState } from '@/hooks/useChatState';

// Import from types/chatContext to ensure compatibility
import { ChatContextType } from '@/types/chatContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const chatState = useChatState();
  
  // Create a memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo<ChatContextType>(() => ({
    ...chatState
  }), [chatState]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  
  return context;
};
