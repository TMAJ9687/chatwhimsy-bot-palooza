
import React, { memo } from 'react';
import { format } from 'date-fns';
import { Check, CheckCheck, Clock } from 'lucide-react';

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
  showStatus?: boolean;
  isBlocked?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  showStatus = false,
  isBlocked = false
}) => {
  const { sender, content, timestamp, status, isImage } = message;
  
  // Don't render for system messages
  if (sender === 'system') return null;
  
  const isUser = sender === 'user';
  
  // Format the timestamp
  const timeString = format(
    typeof timestamp === 'string' ? new Date(timestamp) : timestamp, 
    'h:mm a'
  );
  
  // Status icon based on message status
  const StatusIcon = () => {
    if (!showStatus || !isUser) return null;
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-gray-300" />;
      case 'sent':
        return <Check className="h-3 w-3 text-gray-300" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3 text-gray-300" />;
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-400" />;
      default:
        return null;
    }
  };
  
  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 relative group`}
    >
      <div 
        className={`
          relative max-w-[80%] rounded-2xl p-3 
          ${isUser 
            ? 'bg-blue-500 text-white rounded-br-none' 
            : 'bg-white border border-gray-200 rounded-bl-none'}
          ${isBlocked ? 'opacity-50 grayscale' : ''}
        `}
      >
        {isImage ? (
          <img 
            src={content} 
            alt="Shared" 
            className="rounded-lg max-w-full max-h-60 object-contain"
          />
        ) : (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        )}
        
        <div 
          className={`
            flex text-xs mt-1 opacity-70 items-center
            ${isUser ? 'justify-end' : 'justify-start'}
          `}
        >
          <span>{timeString}</span>
          {isUser && showStatus && (
            <span className="ml-1">
              <StatusIcon />
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Use memo to prevent unnecessary re-renders
export default memo(MessageBubble);
