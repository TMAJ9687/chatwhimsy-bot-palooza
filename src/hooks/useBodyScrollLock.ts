
import { useEffect, useCallback, useRef } from 'react';

interface ScrollLockOptions {
  lockOnMount?: boolean;
  id?: string; // Identifier for the component using scroll lock
}

/**
 * Simple hook to manage body scroll locking without circular dependencies
 */
export const useBodyScrollLock = (options: ScrollLockOptions = {}) => {
  const { lockOnMount = false, id = 'unknown-component' } = options;
  const isLockedRef = useRef(false);
  
  // The lock function
  const lock = useCallback(() => {
    if (document.body) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
      isLockedRef.current = true;
    }
  }, []);
  
  // The unlock function
  const unlock = useCallback(() => {
    if (document.body && isLockedRef.current) {
      document.body.style.overflow = 'auto';
      document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
      isLockedRef.current = false;
    }
  }, []);
  
  // Set up the scroll lock on mount if requested
  useEffect(() => {
    if (lockOnMount) {
      lock();
    }
    
    // Clean up on unmount
    return () => {
      if (isLockedRef.current) {
        unlock();
      }
    };
  }, [lockOnMount, lock, unlock]);
  
  return {
    lock,
    unlock,
    isLocked: isLockedRef.current
  };
};

export default useBodyScrollLock;
