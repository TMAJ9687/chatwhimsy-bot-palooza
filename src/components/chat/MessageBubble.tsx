
import React, { useState } from 'react';
import { Check, Clock, MessageSquare, Repeat } from 'lucide-react';
import { useUser } from '@/context/UserContext';

// Common reaction emojis
const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🔥'];

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  status?: 'sent' | 'delivered' | 'read';
  isImage?: boolean;
  isVoice?: boolean;
  voiceUrl?: string;
  replyTo?: Message | null;
  reactions?: Array<{
    emoji: string;
    userId: string;
    userName: string;
  }>;
  translated?: {
    content: string;
    language: string;
  } | null;
}

interface MessageBubbleProps {
  message: Message;
  isLastInGroup?: boolean;
  showStatus?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
  onTranslate?: (message: Message) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isLastInGroup = false,
  showStatus = false,
  onReply,
  onReact,
  onTranslate
}) => {
  const { isVip } = useUser();
  const [showReactions, setShowReactions] = useState(false);
  const [showTranslated, setShowTranslated] = useState(false);
  
  const timestamp = new Date(message.timestamp);
  const formattedTime = timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  const handleLongPress = () => {
    if (isVip && onReply) {
      setShowReactions(true);
    }
  };
  
  const handleReact = (emoji: string) => {
    if (isVip && onReact) {
      onReact(message, emoji);
      setShowReactions(false);
    }
  };
  
  const handleReply = () => {
    if (isVip && onReply) {
      onReply(message);
      setShowReactions(false);
    }
  };
  
  const handleTranslate = () => {
    if (isVip && onTranslate) {
      onTranslate(message);
      setShowReactions(false);
    }
  };
  
  const toggleTranslation = () => {
    if (message.translated) {
      setShowTranslated(!showTranslated);
    }
  };

  return (
    <div className={`flex flex-col ${message.isUser ? 'items-end' : 'items-start'}`}>
      {/* Reply reference if present */}
      {message.replyTo && (
        <div 
          className={`flex items-center text-xs mb-1 px-2 py-1 rounded ${
            message.isUser 
              ? 'mr-3 bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-300' 
              : 'ml-3 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
          }`}
        >
          <Repeat className="h-3 w-3 mr-1" />
          <span>Reply to {message.replyTo.senderName}</span>
        </div>
      )}
      
      {/* Main message bubble */}
      <div className="group relative">
        <div 
          className={`px-4 py-2 rounded-2xl max-w-xs md:max-w-md break-words ${
            message.isUser 
              ? 'bg-teal-500 text-white ml-8' 
              : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 mr-8'
          }`}
          onContextMenu={(e) => {
            if (isVip) {
              e.preventDefault();
              handleLongPress();
            }
          }}
        >
          {/* Message content */}
          {message.isImage ? (
            <div className="rounded overflow-hidden">
              <img 
                src={message.content} 
                alt="Message attachment" 
                className="max-w-full rounded"
              />
            </div>
          ) : message.isVoice && message.voiceUrl ? (
            <div className="w-full">
              <audio controls className="w-full">
                <source src={message.voiceUrl} type="audio/webm" />
                Your browser does not support the audio element.
              </audio>
            </div>
          ) : (
            <>
              <p className="whitespace-pre-wrap">{
                showTranslated && message.translated 
                  ? message.translated.content 
                  : message.content
              }</p>
              
              {message.translated && (
                <button 
                  onClick={toggleTranslation}
                  className="mt-1 text-xs underline opacity-70 hover:opacity-100"
                >
                  {showTranslated 
                    ? 'Show original' 
                    : `Show translated (${message.translated.language})`
                  }
                </button>
              )}
            </>
          )}
          
          {/* Timestamp */}
          <div 
            className={`text-xs mt-1 ${
              message.isUser ? 'text-teal-100' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {formattedTime}
          </div>
        </div>
        
        {/* Message status indicator for the user's messages */}
        {message.isUser && showStatus && isVip && (
          <div className="absolute -bottom-4 right-2 text-xs text-gray-500 flex items-center">
            {message.status === 'sent' && (
              <span className="flex items-center">
                <Check className="h-3 w-3 mr-0.5" />
                Sent
              </span>
            )}
            {message.status === 'delivered' && (
              <span className="flex items-center">
                <Check className="h-3 w-3 mr-0.5" />
                <Check className="h-3 w-3 -ml-1 mr-0.5" />
                Delivered
              </span>
            )}
            {message.status === 'read' && (
              <span className="flex items-center text-teal-500">
                <Check className="h-3 w-3 mr-0.5" />
                <Check className="h-3 w-3 -ml-1 mr-0.5" />
                Read
              </span>
            )}
          </div>
        )}
        
        {/* Message reactions */}
        {message.reactions && message.reactions.length > 0 && (
          <div 
            className={`absolute ${message.isUser ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'} bottom-2 
              bg-white dark:bg-gray-800 shadow-sm rounded-full px-1.5 py-0.5 flex`}
          >
            {/* Group and count identical reactions */}
            {Object.entries(
              message.reactions.reduce((acc, { emoji }) => {
                acc[emoji] = (acc[emoji] || 0) + 1;
                return acc;
              }, {} as Record<string, number>)
            ).map(([emoji, count]) => (
              <div key={emoji} className="flex items-center">
                <span>{emoji}</span>
                {count > 1 && <span className="text-xs ml-0.5">{count}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Reaction panel - only shown when user long-presses a message */}
      {showReactions && isVip && (
        <div 
          className="absolute z-10 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 mt-2"
          style={{
            [message.isUser ? 'right' : 'left']: '0',
          }}
        >
          <div className="flex space-x-1 mb-2">
            {REACTIONS.map(emoji => (
              <button
                key={emoji}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full p-1.5"
                onClick={() => handleReact(emoji)}
              >
                <span className="text-xl">{emoji}</span>
              </button>
            ))}
          </div>
          
          <div className="flex border-t border-gray-200 dark:border-gray-700 pt-2 space-x-4">
            <button
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={handleReply}
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Reply
            </button>
            
            {!message.isImage && !message.isVoice && (
              <button
                className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={handleTranslate}
              >
                <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12.87 15.07l-2.54-2.51.03-.03A17.52 17.52 0 0014.07 6H17V4h-7V2H8v2H1v2h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"/>
                </svg>
                Translate
              </button>
            )}
            
            <button
              className="flex items-center text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              onClick={() => setShowReactions(false)}
            >
              <X className="h-4 w-4 mr-1" />
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
