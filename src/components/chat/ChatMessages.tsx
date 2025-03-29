
import React, { useRef, memo, useLayoutEffect, useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { useUser } from '@/context/UserContext';
import MessageList from './MessageList';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';
import { useSafeDOMOperations } from '@/hooks/useSafeDOMOperations';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  showStatus?: boolean;
  showTyping?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isTyping,
  showStatus = false,
  showTyping = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isVip } = useUser();
  const { endRef } = useScrollToBottom([messages, isTyping]);
  const { safeRemoveElement, createCleanupFn, isDOMReady } = useSafeDOMOperations();
  const isMountedRef = useRef(true);
  const [isFullyMounted, setIsFullyMounted] = useState(false);
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

  // Track component mounted state with improved lifecycle management
  useEffect(() => {
    isMountedRef.current = true;
    
    // Set fully mounted state in the next frame to ensure DOM is ready
    requestAnimationFrame(() => {
      if (isMountedRef.current) {
        setIsFullyMounted(true);
      }
    });
    
    // Create a cleanup function for overlay elements
    const cleanup = createCleanupFn('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]');
    
    return () => {
      // Mark as unmounted before cleanup
      isMountedRef.current = false;
      setIsFullyMounted(false);
      
      // Run cleanup operation on unmount
      if (isDOMReady()) {
        cleanup();
      }
    };
  }, [createCleanupFn, isDOMReady]);

  // Use useLayoutEffect to ensure DOM operations are performed synchronously
  // before the browser paints, helping prevent race conditions
  useLayoutEffect(() => {
    // Skip if component is not fully mounted yet or already unmounted
    if (!isFullyMounted || !isMountedRef.current || !containerRef.current) return;
    
    // Find any potential problematic elements
    const problematicElements = containerRef.current.querySelectorAll(
      '.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]'
    );
    
    // Safely remove them if found, but only if component is still mounted
    if (problematicElements.length > 0 && isMountedRef.current) {
      console.log(`[ChatMessages] Found ${problematicElements.length} problematic elements, removing...`);
      
      Array.from(problematicElements).forEach(element => {
        if (isMountedRef.current) {
          // Convert Element to HTMLElement for the safeRemoveElement function
          safeRemoveElement(element as Element);
        }
      });
    }
  }, [messages, safeRemoveElement, isFullyMounted]); // Re-run when messages or mount state changes

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      <MessageList 
        messages={messages}
        isTyping={isTyping}
        showStatus={shouldShowStatus}
        showTyping={shouldShowTyping}
      />
      
      <div ref={endRef} />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ChatMessages);
