
import React, { useMemo } from 'react';
import MessageBubble, { Message } from './MessageBubble';
import TypingIndicator from './TypingIndicator';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';

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
  // Use useMemo with proper dependencies to prevent excessive recalculations
  const allMessages = useMemo(() => {
    // Create a stable representation of messages to prevent unnecessary recalculations
    const messageIds = Object.values(userChats).flat().map(msg => msg.id).join(',');
    return Object.values(userChats).flat();
  }, [userChats]);
  
  // Also memoize the message list rendering to prevent excessive re-renders
  const renderedMessages = useMemo(() => {
    return messages?.map((message) => (
      <MessageBubble 
        key={message.id} 
        message={message}
        showStatus={isVip && showStatus}
        allMessages={allMessages.length > 0 ? allMessages : messages}
      />
    ));
  }, [messages, isVip, showStatus, allMessages]);
  
  return (
    <>
      {renderedMessages}
      {isTyping && (isVip ? showTyping : false) && <TypingIndicator />}
    </>
  );
});

MessageList.displayName = 'MessageList';

export default MessageList;
