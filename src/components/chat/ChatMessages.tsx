
import React, { useRef, memo, useEffect, useState } from 'react';
import { Message } from '@/types/chat';
import { useUser } from '@/context/UserContext';
import MessageList from './MessageList';
import { useAutoScroll } from '@/hooks/useAutoScroll';

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
  const endRef = useRef<HTMLDivElement>(null);
  const { isVip } = useUser();
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

  // Auto-scroll when messages change
  useAutoScroll(endRef, [messages, isTyping]);

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
