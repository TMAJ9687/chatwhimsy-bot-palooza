
import { useRef, useCallback, useEffect } from 'react';

export const useScrollToBottom = (dependencies: any[] = []) => {
  const endRef = useRef<HTMLDivElement>(null);
  
  const scrollToBottom = useCallback(() => {
    if (!endRef.current) return;
    
    // Use requestAnimationFrame for smoother scrolling
    requestAnimationFrame(() => {
      endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
    });
  }, []);

  // Scroll to bottom when dependencies change
  useEffect(() => {
    scrollToBottom();
  }, [...dependencies, scrollToBottom]);

  return { endRef, scrollToBottom };
};
