
import React, { createContext, useContext, ReactNode } from 'react';
import { ChatContextType } from '@/types/chatContext';
import { useUser } from './UserContext';
import { useChatState } from '@/hooks/useChatState';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Get user info and VIP status from UserContext
  const { isVip: userIsVip, isAdmin } = useUser();
  
  // Ensure admins always have VIP benefits in chat
  const isVip = userIsVip || isAdmin;
  
  // Use our custom hook for all chat state
  const chatState = useChatState(isVip || false);

  return (
    <ChatContext.Provider value={chatState}>
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
