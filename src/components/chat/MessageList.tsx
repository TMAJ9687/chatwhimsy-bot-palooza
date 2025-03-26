
import React from 'react';
import MessageBubble, { Message } from './MessageBubble';
import TypingIndicator from './TypingIndicator';

interface MessageListProps {
  messages: Message[];
  isTyping: boolean;
  showStatus: boolean;
  showTyping: boolean;
}

const MessageList = React.memo(({ 
  messages, 
  isTyping, 
  showStatus, 
  showTyping 
}: MessageListProps) => {
  return (
    <>
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={showStatus}
        />
      ))}
      
      {isTyping && showTyping && <TypingIndicator />}
    </>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
