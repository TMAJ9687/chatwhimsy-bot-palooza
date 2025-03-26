import React, { useRef, useEffect, useCallback, memo } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useUser } from '@/context/UserContext';
import { Message } from './types/MessageTypes';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  showStatus?: boolean;
  showTyping?: boolean;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isTyping,
  showStatus = true,
  showTyping = true
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isVip } = useUser();
  
  const scrollToBottom = useCallback(() => {
    if (!messagesEndRef.current) return;
    
    messagesEndRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(scrollToBottom, 0);
    return () => clearTimeout(timeoutId);
  }, [messages, isTyping, scrollToBottom]);

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900"
    >
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={isVip && showStatus}
        />
      ))}
      
      {isTyping && showTyping && isVip && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

export default memo(ChatMessages);
