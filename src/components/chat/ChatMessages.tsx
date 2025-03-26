
import React, { useRef, useEffect, useCallback, memo } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useUser } from '@/context/UserContext';
import { useChat } from '@/context/ChatContext';
import { ShieldAlert } from 'lucide-react';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
  showStatus?: boolean;
  showTyping?: boolean;
  currentBotId: string;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ 
  messages, 
  isTyping,
  showStatus = true,
  showTyping = true,
  currentBotId
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { isVip } = useUser();
  const { blockedUsers } = useChat();
  
  const isBlocked = blockedUsers.includes(currentBotId);
  
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
      {isBlocked && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 my-4 text-center">
          <div className="flex items-center justify-center mb-2">
            <ShieldAlert className="h-5 w-5 text-red-500 mr-2" />
            <span className="font-medium text-red-600">User Blocked</span>
          </div>
          <p className="text-sm text-red-600">
            You have blocked this user. You won't receive any new messages from them.
          </p>
        </div>
      )}
      
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={isVip && showStatus}
          isBlocked={isBlocked && message.sender === 'bot'}
        />
      ))}
      
      {isTyping && showTyping && isVip && !isBlocked && <TypingIndicator />}
      
      <div ref={messagesEndRef} />
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(ChatMessages);
