
import React from 'react';
import { Check, Clock } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot' | 'system';
  timestamp: Date;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
  isImage?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isLastInGroup?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLastInGroup = false 
}) => {
  const { sender, content, timestamp, status, isImage } = message;
  const isUser = sender === 'user';
  
  // If this is a system message, render differently
  if (sender === 'system') {
    return (
      <div className="text-center text-gray-500 text-sm py-2">
        {content}
      </div>
    );
  }
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  const getStatusIcon = () => {
    if (!isUser) return null;
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-400" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-400" />;
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <Check className="h-3 w-3 text-gray-400" />
            <Check className="h-3 w-3 text-gray-400" />
          </div>
        );
      case 'read':
        return (
          <div className="flex -space-x-1 text-teal-500">
            <Check className="h-3 w-3" />
            <Check className="h-3 w-3" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1.5`}>
      <div
        className={`
          relative px-3 py-2 rounded-2xl max-w-[80%]
          ${isUser 
            ? 'bg-teal-500 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none'}
        `}
      >
        {isImage ? (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={content} 
              alt="Shared image" 
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm">{content}</div>
        )}
      </div>
      
      {isLastInGroup && (
        <div className={`flex items-center mt-0.5 text-xs text-gray-500 ${isUser ? 'mr-1' : 'ml-1'}`}>
          <span>{formattedTime}</span>
          {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
