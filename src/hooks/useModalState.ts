
import { useState, useCallback, useEffect } from 'react';
import { useOverlay } from '@/context/OverlayContext';

/**
 * A hook to manage modal state with proper cleanup
 */
export const useModalState = (modalId: string) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const { openOverlay, closeOverlay } = useOverlay();
  
  // Register/unregister with overlay context
  useEffect(() => {
    if (isOpen) {
      openOverlay(modalId);
    } else {
      closeOverlay(modalId);
    }
    
    return () => {
      closeOverlay(modalId);
    };
  }, [modalId, isOpen, openOverlay, closeOverlay]);
  
  // Handle open and close with smooth transitions
  const open = useCallback(() => {
    setIsClosing(false);
    setIsOpen(true);
  }, []);
  
  const close = useCallback(() => {
    setIsClosing(true);
    
    // Allow animations to complete before fully closing
    const timer = setTimeout(() => {
      setIsOpen(false);
      setIsClosing(false);
    }, 300); // Match with your animation duration
    
    return () => clearTimeout(timer);
  }, []);
  
  return {
    isOpen,
    isClosing,
    open,
    close
  };
};

export default useModalState;
