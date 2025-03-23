
import React from 'react';
import { Check, Clock } from 'lucide-react';

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
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
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  const getStatusIcon = () => {
    if (!isUser) return null;
    
    switch (status) {
      case 'sending':
        return <Clock className="h-3 w-3 text-white/70" />;
      case 'sent':
        return <Check className="h-3 w-3 text-white/70" />;
      case 'delivered':
        return (
          <div className="flex -space-x-1">
            <Check className="h-3 w-3 text-white/70" />
            <Check className="h-3 w-3 text-white/70" />
          </div>
        );
      case 'read':
        return (
          <div className="flex -space-x-1 text-secondary">
            <Check className="h-3 w-3" />
            <Check className="h-3 w-3" />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1 animate-scale`}>
      <div
        className={`
          relative px-4 py-2 rounded-2xl max-w-[280px] sm:max-w-[320px] shadow-sm
          ${isUser 
            ? 'bg-primary text-white rounded-br-none' 
            : 'bg-white text-foreground rounded-bl-none'}
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
          <div className="whitespace-pre-wrap break-words">{content}</div>
        )}
      </div>
      
      {isLastInGroup && (
        <div className={`flex items-center mt-1 text-xs text-muted-foreground ${isUser ? 'mr-1' : 'ml-1'}`}>
          <span>{formattedTime}</span>
          {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
