
import React, { useRef, memo, useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { useUser } from '@/context/UserContext';
import MessageList from './MessageList';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

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
  const [isFullyMounted, setIsFullyMounted] = useState(false);
  const previousMessagesLengthRef = useRef(0);
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

  // Prevent excessive re-renders by checking if messages array actually changed
  useEffect(() => {
    // Store previous length to detect actual changes
    previousMessagesLengthRef.current = messages.length;
  }, [messages]);

  // Track component mounted state with improved lifecycle management
  useEffect(() => {
    let mounted = true;
    
    // Set fully mounted state in the next frame to ensure DOM is ready
    const frameId = requestAnimationFrame(() => {
      if (mounted) {
        setIsFullyMounted(true);
      }
    });
    
    return () => {
      // Mark as unmounted before cleanup
      mounted = false;
      cancelAnimationFrame(frameId);
      setIsFullyMounted(false);
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
