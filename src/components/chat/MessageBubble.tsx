
import React, { useState } from 'react';
import { format, isToday, isYesterday } from 'date-fns';
import { Check, Clock, Download, Globe, Reply, X } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { translateText, SUPPORTED_LANGUAGES } from '@/utils/translationService';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  status?: 'sent' | 'delivered' | 'read' | 'sending';
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
  showStatus?: boolean;
  isLast?: boolean;
  onReply?: (message: Message) => void;
  onReact?: (message: Message, emoji: string) => void;
}

// Common emojis for quick reactions
const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '👏', '🔥', '🙏'];

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  showStatus = false,
  isLast = false,
  onReply,
  onReact
}) => {
  const { isVip } = useUser();
  const { toast } = useToast();
  const [showReactions, setShowReactions] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showTranslationOptions, setShowTranslationOptions] = useState(false);

  // Get formatted time
  const formattedTime = formatTimestamp(message.timestamp);
  
  // Handle emoji reaction click
  const handleReact = (emoji: string) => {
    if (onReact) {
      onReact(message, emoji);
    }
    setShowReactions(false);
  };

  // Handle reply click
  const handleReply = () => {
    if (onReply) {
      onReply(message);
    }
  };

  // Handle translation
  const handleTranslate = async (languageCode: string) => {
    setIsTranslating(true);
    setShowTranslationOptions(false);
    
    try {
      const result = await translateText(message.content, languageCode);
      
      // Update message with translation
      message.translated = {
        content: result.translatedText,
        language: languageCode
      };
      
      // Force re-render
      setIsTranslating(false);
    } catch (error) {
      console.error('Translation error:', error);
      toast({
        title: "Translation Failed",
        description: "Could not translate the message. Please try again.",
        variant: "destructive"
      });
      setIsTranslating(false);
    }
  };

  // Clear translation
  const handleClearTranslation = () => {
    message.translated = null;
    // Force re-render
    setIsTranslating(false);
  };

  return (
    <div className={`mb-4 ${message.isUser ? 'ml-12 lg:ml-24' : 'mr-12 lg:mr-24'}`}>
      {/* Replied message, if any */}
      {message.replyTo && (
        <div className={`mb-1 text-xs flex items-center rounded-t-md pl-2 py-1
          ${message.isUser ? 'bg-primary-foreground ml-auto rounded-l-md' : 'bg-muted mr-auto rounded-r-md'}`}
        >
          <Reply className="h-3 w-3 mr-1 text-muted-foreground" />
          <span className="text-muted-foreground mr-1">
            Replying to {message.replyTo.isUser ? 'yourself' : message.replyTo.senderName}:
          </span>
          <span className="truncate max-w-[150px]">
            {message.replyTo.content}
          </span>
        </div>
      )}
      
      {/* Main message bubble */}
      <div className={`group relative flex ${message.isUser ? 'justify-end' : 'justify-start'}`}>
        {/* Avatar or icon */}
        <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center 
          ${message.isUser ? 'order-last ml-2' : 'order-first mr-2'}
          ${message.isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          {message.senderName.charAt(0).toUpperCase()}
        </div>
        
        {/* Message content */}
        <div
          className={`relative px-4 py-2 rounded-lg max-w-[80%] sm:max-w-[70%] break-words
            ${message.isUser 
              ? 'bg-primary text-primary-foreground rounded-br-none' 
              : 'bg-muted text-foreground rounded-bl-none'}`}
        >
          {/* Message reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="absolute -top-6 left-0 bg-background border border-border rounded-full py-1 px-2 flex space-x-1">
              {message.reactions.map((reaction, i) => (
                <div key={`${reaction.userId}-${i}`} title={`${reaction.userName}`} className="cursor-default">
                  {reaction.emoji}
                </div>
              ))}
            </div>
          )}
          
          {/* Sender name for non-user messages */}
          {!message.isUser && (
            <div className="font-medium text-sm mb-1">{message.senderName}</div>
          )}
          
          {/* Message content */}
          {message.isImage ? (
            <img 
              src={message.content} 
              alt="Shared media" 
              className="max-h-40 rounded object-contain cursor-pointer"
              onClick={() => {
                // Expand image or open in viewer
                window.open(message.content, '_blank');
              }}
            />
          ) : message.isVoice ? (
            <div className="w-48 sm:w-56">
              <audio controls src={message.voiceUrl} className="w-full" />
            </div>
          ) : (
            <div>
              <p className={`whitespace-pre-wrap ${message.translated ? 'pb-1' : ''}`}>
                {message.content}
              </p>
              
              {/* Translated content */}
              {message.translated && (
                <div className="mt-1 pt-1 border-t border-white/20 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center text-xs text-primary-foreground/70">
                      <Globe className="h-3 w-3 mr-1" />
                      <span>Translated to {
                        SUPPORTED_LANGUAGES.find(lang => lang.code === message.translated?.language)?.name || 
                        message.translated?.language
                      }</span>
                    </div>
                    <button 
                      onClick={handleClearTranslation}
                      className="text-primary-foreground/70 hover:text-primary-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                  <p className="text-sm">{message.translated.content}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Message timestamp and status */}
          <div className={`text-xs mt-1 flex items-center justify-end
            ${message.isUser ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}
          >
            <span>{formattedTime}</span>
            
            {/* Message status for user messages */}
            {message.isUser && showStatus && (
              <span className="ml-1 flex items-center">
                {message.status === 'sending' && <Clock className="h-3 w-3 ml-1" />}
                {message.status === 'sent' && <Check className="h-3 w-3 ml-1" />}
                {message.status === 'delivered' && <Check className="h-3 w-3 ml-1" />}
                {message.status === 'read' && <Check className="h-3 w-3 ml-1" />}
              </span>
            )}
          </div>
        </div>
        
        {/* VIP Only: Message actions */}
        {isVip && (
          <div className={`absolute -top-10 ${message.isUser ? 'right-10' : 'left-10'} 
                           opacity-0 group-hover:opacity-100 transition-opacity flex gap-1`}>
            {/* Reply button */}
            <button 
              onClick={handleReply}
              className="bg-background hover:bg-muted h-8 w-8 rounded-full flex items-center justify-center border border-border shadow-sm"
              title="Reply"
            >
              <Reply className="h-4 w-4 text-muted-foreground" />
            </button>
            
            {/* Reactions button */}
            <div className="relative">
              <button 
                onClick={() => setShowReactions(!showReactions)}
                className="bg-background hover:bg-muted h-8 w-8 rounded-full flex items-center justify-center border border-border shadow-sm"
                title="React"
              >
                <span className="text-lg leading-none">😊</span>
              </button>
              
              {/* Reactions popup */}
              {showReactions && (
                <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background rounded-full py-1 px-2 border border-border shadow-md flex">
                  {COMMON_EMOJIS.map(emoji => (
                    <button 
                      key={emoji}
                      className="h-8 w-8 flex items-center justify-center hover:bg-muted rounded-full transition-colors"
                      onClick={() => handleReact(emoji)}
                    >
                      <span className="text-xl">{emoji}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Translation button (only for text messages) */}
            {!message.isImage && !message.isVoice && (
              <div className="relative">
                <button 
                  onClick={() => setShowTranslationOptions(!showTranslationOptions)}
                  className="bg-background hover:bg-muted h-8 w-8 rounded-full flex items-center justify-center border border-border shadow-sm"
                  title="Translate"
                  disabled={isTranslating}
                >
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </button>
                
                {/* Translation options */}
                {showTranslationOptions && (
                  <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-background rounded-lg py-2 px-1 border border-border shadow-md w-40 max-h-48 overflow-y-auto">
                    <div className="text-xs font-medium px-2 pb-1 mb-1 border-b border-border">
                      Translate to:
                    </div>
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button 
                        key={lang.code}
                        className="w-full text-left px-2 py-1 text-sm hover:bg-muted rounded"
                        onClick={() => handleTranslate(lang.code)}
                      >
                        {lang.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Download button for images */}
            {message.isImage && (
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = message.content;
                  a.download = `image-${Date.now()}.jpg`;
                  a.click();
                }}
                className="bg-background hover:bg-muted h-8 w-8 rounded-full flex items-center justify-center border border-border shadow-sm"
                title="Download"
              >
                <Download className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: Date): string => {
  if (isToday(timestamp)) {
    return format(timestamp, 'h:mm a');
  } else if (isYesterday(timestamp)) {
    return 'Yesterday ' + format(timestamp, 'h:mm a');
  } else {
    return format(timestamp, 'MMM d, h:mm a');
  }
};

export default MessageBubble;
