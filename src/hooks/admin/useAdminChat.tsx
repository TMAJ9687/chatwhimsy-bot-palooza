
import { useState, useCallback } from 'react';

export const useAdminChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const openChat = useCallback(() => {
    setIsChatOpen(true);
    // Lock body scroll when chat is open
    document.body.style.overflow = 'hidden';
  }, []);
  
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    // Restore body scroll when chat is closed
    document.body.style.overflow = 'auto';
  }, []);
  
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => {
      const newState = !prev;
      // Update body scroll based on new state
      document.body.style.overflow = newState ? 'hidden' : 'auto';
      return newState;
    });
  }, []);
  
  return {
    isChatOpen,
    openChat,
    closeChat,
    toggleChat
  };
};
