
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
  const { safeRemoveElement, createCleanupFn } = useSafeDOMOperations();
  const isMountedRef = useRef(true);
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

  // Track component mounted state
  useEffect(() => {
    isMountedRef.current = true;
    
    // Create a cleanup function for overlay elements
    const cleanup = createCleanupFn('.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]');
    
    return () => {
      // Mark as unmounted before cleanup
      isMountedRef.current = false;
      
      // Run cleanup operation
      cleanup();
    };
  }, [createCleanupFn]);

  // Use useLayoutEffect to ensure DOM operations are performed synchronously
  // before the browser paints, helping prevent race conditions
  useLayoutEffect(() => {
    // Make sure the component is still mounted and container exists
    if (!containerRef.current || !isMountedRef.current) return;
    
    // Find any potential problematic elements
    const problematicElements = containerRef.current.querySelectorAll(
      '.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]'
    );
    
    // Safely remove them if found, but only if component is still mounted
    if (problematicElements.length > 0 && isMountedRef.current) {
      console.log(`[ChatMessages] Found ${problematicElements.length} problematic elements, removing...`);
      
      problematicElements.forEach(element => {
        if (isMountedRef.current) {
          safeRemoveElement(element);
        }
      });
    }
  }, [messages, safeRemoveElement]); // Re-run when messages change

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
