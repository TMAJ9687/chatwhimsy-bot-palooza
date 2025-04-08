
import { useState, useCallback, useEffect, useRef } from 'react';
import { useUIState } from '@/context/UIStateContext';

/**
 * Hook to manage admin chat state with improved performance
 */
export const useAdminChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { lockBody, unlockBody } = useUIState();
  const chatStateRef = useRef({ isOpen: false });
  
  // Use useEffect to manage body scroll locking and prevent excessive logging
  useEffect(() => {
    // Only make DOM changes when chat state actually changes
    if (chatStateRef.current.isOpen !== isChatOpen) {
      chatStateRef.current.isOpen = isChatOpen;
      
      if (isChatOpen) {
        lockBody();
      } else {
        unlockBody();
      }
    }
    
    // Clean up on unmount - ensure body scroll is restored
    return () => {
      if (chatStateRef.current.isOpen) {
        unlockBody();
      }
    };
  }, [isChatOpen, lockBody, unlockBody]);
  
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
