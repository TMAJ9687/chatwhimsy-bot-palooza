
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
  onReplyMessage?: (message: Message) => void;
  onUnsendMessage?: (messageId: string) => void;
}

const MessageList = React.memo(({ 
  messages, 
  isTyping, 
  showStatus, 
  showTyping,
  isVip = false,
  onReplyMessage,
  onUnsendMessage
}: MessageListProps) => {
  return (
    <>
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={showStatus}
          isVip={isVip}
          onReply={onReplyMessage}
          onUnsend={onUnsendMessage}
        />
      ))}
      
      {isTyping && showTyping && <TypingIndicator />}
    </>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
