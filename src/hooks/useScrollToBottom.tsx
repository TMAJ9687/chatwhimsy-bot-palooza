
import { useRef, useCallback, useEffect } from 'react';

export const useScrollToBottom = (dependencies: any[] = []) => {
  const endRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = useCallback(() => {
    if (!endRef.current) return;
    
    // Use scrollIntoView with a simpler configuration
    endRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  // Scroll to bottom when dependencies change
  useEffect(() => {
    // Small timeout to ensure DOM is updated
    const timeoutId = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeoutId);
  }, [...dependencies, scrollToBottom]);

  return { endRef, scrollToBottom };
};
