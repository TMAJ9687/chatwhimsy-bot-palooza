
import { useEffect, useRef } from 'react';

/**
 * Hook to manage body scroll locking with improved performance
 * @param isLocked Whether the body scroll should be locked
 */
const useBodyScrollLock = (isLocked: boolean): void => {
  // Use ref to store original style to ensure we restore correctly
  const originalStyleRef = useRef<string | null>(null);
  
  useEffect(() => {
    // DOM elements and styles are only modified when needed
    if (isLocked) {
      // Cache the original body style only once
      if (originalStyleRef.current === null) {
        originalStyleRef.current = window.getComputedStyle(document.body).overflow;
      }
      
      // Use a single class-based approach for better performance
      if (!document.body.classList.contains('overflow-hidden')) {
        document.body.classList.add('overflow-hidden');
      }
      
      // Cleanup function to restore original style
      return () => {
        // Remove class instead of directly manipulating style for better perf
        document.body.classList.remove('overflow-hidden', 'dialog-open', 'modal-open');
        
        // Only restore original style if we've changed it and if we have a reference
        if (originalStyleRef.current !== null) {
          document.body.style.overflow = originalStyleRef.current;
        }
      };
    }
    // No need to do anything if not locked
    return undefined;
  }, [isLocked]); // Only re-run if locked state changes
};

export default useBodyScrollLock;
