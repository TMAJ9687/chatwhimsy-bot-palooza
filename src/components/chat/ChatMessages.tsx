
import React, { useRef, memo } from 'react';
import { Message } from '@/types/chat';
import { useUser } from '@/context/UserContext';
import MessageList from './MessageList';
import { useScrollToBottom } from '@/hooks/useScrollToBottom';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  showStatus?: boolean;
  showTyping?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onUnsend?: (messageId: string) => void;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isTyping,
  showStatus = true,
  showTyping = true,
  onReply,
  onReact,
  onUnsend
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isVip } = useUser();
  const { endRef } = useScrollToBottom([messages, isTyping]);
  
  // Only show status and typing indicators for VIP users
  const shouldShowStatus = isVip && showStatus;
  const shouldShowTyping = isVip && showTyping;

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
        isVip={isVip}
        onReply={onReply}
        onReact={onReact}
        onUnsend={onUnsend}
      />
      
      <div ref={endRef} />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ChatMessages);
