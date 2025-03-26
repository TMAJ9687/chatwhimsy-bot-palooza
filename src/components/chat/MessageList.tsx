
import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { Message } from '@/types/chat';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  showStatus: boolean;
  showTyping: boolean;
  isVip?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (messageId: string, reaction: string) => void;
  onUnsend?: (messageId: string) => void;
}

const MessageList = React.memo(({ 
  messages, 
  isTyping, 
  showStatus, 
  showTyping,
  isVip = false,
  onReply,
  onReact,
  onUnsend
}: MessageListProps) => {
  return (
    <>
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={showStatus}
          isVip={isVip}
          onReply={onReply}
          onReact={onReact}
          onUnsend={onUnsend}
        />
      ))}
      
      {isTyping && showTyping && <TypingIndicator />}
    </>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
