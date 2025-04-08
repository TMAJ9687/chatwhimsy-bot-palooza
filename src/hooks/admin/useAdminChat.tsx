
import { useState, useCallback, useEffect, useRef } from 'react';
import { useUIState } from '@/context/UIStateContext';

/**
 * Hook to manage admin chat state with improved performance
 */
export const useAdminChat = () => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { lockBody, unlockBody } = useUIState();
  const chatStateRef = useRef({ isOpen: false, lockApplied: false });
  
  // Use useEffect to manage body scroll locking with state reference to prevent thrashing
  useEffect(() => {
    // Only make DOM changes when chat state actually changes
    if (chatStateRef.current.isOpen !== isChatOpen) {
      chatStateRef.current.isOpen = isChatOpen;
      
      if (isChatOpen && !chatStateRef.current.lockApplied) {
        lockBody();
        chatStateRef.current.lockApplied = true;
      } else if (!isChatOpen && chatStateRef.current.lockApplied) {
        unlockBody();
        chatStateRef.current.lockApplied = false;
      }
    }
    
    // Clean up on unmount - ensure body scroll is restored
    return () => {
      if (chatStateRef.current.lockApplied) {
        unlockBody();
        chatStateRef.current.lockApplied = false;
      }
    };
  }, [isChatOpen, lockBody, unlockBody]);
  
  // Use state reference to prevent unnecessary state updates
  const openChat = useCallback(() => {
    if (!chatStateRef.current.isOpen) {
      setIsChatOpen(true);
    }
  }, []);
  
  const closeChat = useCallback(() => {
    if (chatStateRef.current.isOpen) {
      setIsChatOpen(false);
    }
  }, []);
  
  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);
  
  return { isChatOpen, openChat, closeChat, toggleChat };
};
