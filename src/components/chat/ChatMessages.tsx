
import React, { useRef, useEffect, useCallback } from 'react';
import MessageBubble, { Message } from './MessageBubble';

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
  
  // Optimized scroll to bottom implementation that won't cause freezes
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
      className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
    >
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          isLastInGroup={true}
          showStatus={showStatus}
        />
      ))}
      
      {isTyping && showTyping && (
        <div className="flex items-start">
          <div className="bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm inline-flex space-x-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '600ms' }}></div>
          </div>
        </div>
      )}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default React.memo(ChatMessages);
