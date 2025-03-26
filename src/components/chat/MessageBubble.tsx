
import React from 'react';
import ImageMessage from './ImageMessage';
import MessageContent from './MessageContent';
import MessageStatus from './MessageStatus';
import { MessageProps } from './types/MessageTypes';

// Moving types to a separate file for better organization
export type { Message } from './types/MessageTypes';

const MessageBubble: React.FC<MessageProps> = ({ 
  message, 
  isLastInGroup = false,
  showStatus = true
}) => {
  const { sender, content, timestamp, status, isImage } = message;
  const isUser = sender === 'user';
  
  // If this is a system message, render differently
  if (sender === 'system') {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
        {content}
      </div>
    );
  }
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1.5`}>
      <div
        className={`
          relative px-3 py-2 rounded-2xl max-w-[80%]
          ${isUser 
            ? 'bg-teal-500 text-white rounded-br-none' 
            : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}
        `}
      >
        {isImage ? (
          <ImageMessage content={content} />
        ) : (
          <MessageContent content={content} />
        )}
      </div>
      
      {isLastInGroup && showStatus && (
        <div className={`flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'mr-1' : 'ml-1'}`}>
          <span>{formattedTime}</span>
          <span className="ml-1">
            <MessageStatus status={status} isUser={isUser} showStatus={showStatus} />
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageBubble);
