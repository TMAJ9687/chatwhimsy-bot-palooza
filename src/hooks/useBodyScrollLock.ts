
import { useEffect } from 'react';
import { useUIState } from '@/context/UIStateContext';

interface ScrollLockOptions {
  lockOnMount?: boolean;
  id?: string; // Identifier for the component using scroll lock
}

/**
 * Hook to manage body scroll locking in a declarative way
 */
export const useBodyScrollLock = (options: ScrollLockOptions = {}) => {
  const { lockOnMount = false, id = 'unknown-component' } = options;
  const { lockBody, unlockBody, addOverlay, removeOverlay, isOverlayActive } = useUIState();
  
  // Set up the scroll lock on mount if requested
  useEffect(() => {
    if (lockOnMount) {
      lockBody();
      addOverlay(id);
    }
    
    // Clean up on unmount
    return () => {
      removeOverlay(id);
      // Only unlock the body if no other overlays are active
      if (!isOverlayActive(id)) {
        unlockBody();
      }
    };
  }, [lockOnMount, lockBody, unlockBody, addOverlay, removeOverlay, isOverlayActive, id]);
  
  return {
    lock: () => {
      lockBody();
      addOverlay(id);
    },
    unlock: () => {
      removeOverlay(id);
      // Only unlock if no other overlays are active
      if (!isOverlayActive(id)) {
        unlockBody();
      }
    },
    isLocked: isOverlayActive(id)
  };
};
