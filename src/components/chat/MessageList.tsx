
import React from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import { Message } from '@/types/chat';

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
  const { userChats } = useChat();
  const { isVip } = useUser();
  
  // Collect all messages across all chats to make them available for reply references
  const allMessages = React.useMemo(() => {
    return Object.values(userChats).flat();
  }, [userChats]);
  
  return (
    <>
      {messages?.map((message) => (
        <MessageBubble 
          key={message.id} 
          message={message}
          showStatus={isVip && showStatus}
          allMessages={allMessages.length > 0 ? allMessages : messages}
        />
      ))}
      
      {isTyping && (isVip ? showTyping : false) && <TypingIndicator />}
    </>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
