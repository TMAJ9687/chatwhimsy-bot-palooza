
import { useEffect } from 'react';

/**
 * Hook to lock/unlock body scroll in a React-friendly way
 * Replaces direct DOM manipulation with proper React effects
 */
export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!document || !document.body) return;
    
    // Store original body style
    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;
    
    if (locked) {
      // Calculate scrollbar width to prevent layout shift
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Apply styles in a batch to minimize reflows
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    } else {
      // Reset styles
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    }
    
    // Cleanup function to reset styles on unmount or when dependency changes
    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [locked]); // Only re-run when locked state changes
};

export default useBodyScrollLock;
