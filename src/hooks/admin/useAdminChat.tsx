
import { useState, useCallback } from 'react';
import useBodyScrollLock from '@/hooks/useBodyScrollLock';

/**
 * Hook to manage admin chat state
 */
export const useAdminChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Use our hook to properly manage body scroll locking when chat is open
  useBodyScrollLock(isChatOpen);
  
  const openChat = useCallback(() => {
    setIsChatOpen(true);
  }, []);
  
  const closeChat = useCallback(() => {
    setIsChatOpen(false);
  }, []);
  
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);
  
  return { isChatOpen, openChat, closeChat, toggleChat };
};
