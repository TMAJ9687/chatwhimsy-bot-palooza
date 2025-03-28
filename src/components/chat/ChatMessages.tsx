
import React, { useRef, memo, useLayoutEffect, useEffect } from 'react';
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
  const { safeRemoveElement } = useSafeDOMOperations();
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

  // Use useLayoutEffect to ensure DOM operations are performed synchronously
  // before the browser paints, helping prevent race conditions
  useLayoutEffect(() => {
    // Make sure the container exists
    if (!containerRef.current) return;
    
    // Find any potential problematic elements
    const problematicElements = containerRef.current.querySelectorAll(
      '.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]'
    );
    
    // Safely remove them if found
    if (problematicElements.length > 0) {
      console.log(`[ChatMessages] Found ${problematicElements.length} problematic elements, removing...`);
      
      problematicElements.forEach(element => {
        safeRemoveElement(element);
      });
    }
  }, [messages, safeRemoveElement]); // Re-run when messages change

  // Additional cleanup on component unmount to prevent removeChild errors
  useEffect(() => {
    return () => {
      // Important: when component unmounts, make sure we don't leave problematic elements
      if (containerRef.current) {
        const problematicElements = containerRef.current.querySelectorAll(
          '.fixed.inset-0, [data-radix-dialog-overlay], [data-radix-alert-dialog-overlay]'
        );
        
        if (problematicElements.length > 0) {
          problematicElements.forEach(element => {
            try {
              if (element.parentNode) {
                element.parentNode.removeChild(element);
              }
            } catch (error) {
              console.warn('[ChatMessages] Error removing element on unmount:', error);
            }
          });
        }
      }
    };
  }, []);

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
