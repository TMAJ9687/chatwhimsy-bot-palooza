
import { useEffect } from 'react';

/**
 * Hook to manage body scroll locking with improved performance
 * @param isLocked Whether the body scroll should be locked
 */
const useBodyScrollLock = (isLocked: boolean): void => {
  useEffect(() => {
    // DOM elements and styles are only modified when needed
    if (isLocked) {
      // Cache the original body style
      const originalStyle = window.getComputedStyle(document.body).overflow;
      // Apply the lock
      document.body.style.overflow = 'hidden';
      document.body.classList.add('dialog-open');
      
      // Cleanup function to restore original style
      return () => {
        document.body.style.overflow = originalStyle;
        document.body.classList.remove('dialog-open', 'overflow-hidden', 'modal-open');
      };
    }
    // No need to do anything if not locked
    return undefined;
  }, [isLocked]); // Only re-run if locked state changes
};

export default useBodyScrollLock;
