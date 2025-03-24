
import React, { useRef, useEffect, useCallback, memo } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import TypingIndicator from './TypingIndicator';

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
  
  // Optimized scroll to bottom implementation
  const scrollToBottom = useCallback(() => {
    if (!messagesEndRef.current) return;
    
    // Use scrollIntoView with a simpler configuration
    messagesEndRef.current.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, []);

  // Scroll to bottom when messages change or typing status changes
  useEffect(() => {
    // Small timeout to ensure DOM is updated
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
          isLastInGroup={true}
          showStatus={showStatus}
        />
      ))}
      
      {isTyping && showTyping && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ChatMessages);
