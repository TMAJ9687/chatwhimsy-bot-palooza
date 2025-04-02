
import { useCallback, useEffect, useId } from 'react';
import { useUI } from '@/context/UIContext';

interface UseModalOptions {
  lockBodyScroll?: boolean;
}

export const useModal = (options: UseModalOptions = {}) => {
  const { lockBodyScroll = true } = options;
  const modalId = useId();
  const { registerModal, unregisterModal, lockBody, unlockBody } = useUI();
  
  // Register this modal instance with the UI context
  useEffect(() => {
    registerModal(modalId);
    
    if (lockBodyScroll) {
      lockBody();
    }
    
    return () => {
      unregisterModal(modalId);
      
      if (lockBodyScroll) {
        unlockBody();
      }
    };
  }, [modalId, registerModal, unregisterModal, lockBodyScroll, lockBody, unlockBody]);
  
  // Convenient method to manually lock/unlock body scroll
  const toggleBodyLock = useCallback((lock: boolean) => {
    if (lock) {
      lockBody();
    } else {
      unlockBody();
    }
  }, [lockBody, unlockBody]);
  
  return {
    modalId,
    toggleBodyLock
  };
};
