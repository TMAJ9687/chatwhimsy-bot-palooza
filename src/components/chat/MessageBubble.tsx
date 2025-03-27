import React, { useState } from 'react';
import { Check, Clock, Eye, EyeOff, Maximize, X, Globe, Reply, Smile, Trash } from 'lucide-react';
import { Message as MessageType, MessageStatus } from '@/types/chat';
import { renderContentWithEmojis } from '@/utils/emojiUtils';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import TranslateMessageDialog from './TranslateMessageDialog';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPicker from './EmojiPicker';

export interface Message extends MessageType {}

interface MessageBubbleProps {
  message: Message;
  isLastInGroup?: boolean;
  showStatus?: boolean;
  allMessages?: Message[]; // Added to find reply reference
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLastInGroup = false,
  showStatus = true,
  allMessages = []
}) => {
  const { sender, content, timestamp, status, isImage, isVoice, duration, translations, replyTo, reactions, isDeleted } = message;
  const isUser = sender === 'user';
  const isBot = sender === 'bot';
  const { isVip } = useUser();
  const { 
    handleTranslateMessage, 
    handleReactToMessage, 
    handleReplyToMessage, 
    handleUnsendMessage,
    setReplyingToMessage
  } = useChat();
  
  const [isBlurred, setIsBlurred] = useState(isImage ? true : false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showReactionPopover, setShowReactionPopover] = useState(false);
  
  // Find the message being replied to
  const replyToMessage = replyTo ? allMessages.find(m => m.id === replyTo) : null;
  
  // If this is a system message, render differently
  if (sender === 'system') {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-2">
        {content}
      </div>
    );
  }

  // If message was deleted
  if (isDeleted) {
    return (
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1.5`}>
        <div
          className={`
            relative px-3 py-2 rounded-2xl max-w-[80%] bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 italic
            ${isUser ? 'rounded-br-none' : 'rounded-bl-none'}
          `}
        >
          This message was unsent
        </div>
        {isLastInGroup && showStatus && (
          <div className={`flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'mr-1' : 'ml-1'}`}>
            <span>{new Intl.DateTimeFormat('en-US', {
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            }).format(timestamp)}</span>
          </div>
        )}
      </div>
    );
  }
  
  const formattedTime = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(timestamp);

  const getStatusIcon = () => {
    if (!isUser || !showStatus) return null;
    
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

  const handleToggleBlur = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsBlurred(!isBlurred);
  };

  const handleToggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isBlurred) {
      setIsFullScreen(!isFullScreen);
    }
  };

  const handleCloseFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFullScreen(false);
  };

  const handleTranslate = () => {
    setShowTranslationDialog(true);
  };

  const handleTranslateConfirm = (language: string) => {
    if (message.id) {
      handleTranslateMessage(message.id, language);
      setShowTranslation(true);
    }
  };

  const handleReplyClick = () => {
    if (message.id) {
      setReplyingToMessage(message);
    }
  };

  const handleReactClick = (emoji: string) => {
    if (message.id) {
      handleReactToMessage(message.id, emoji);
      setShowReactionPopover(false);
    }
  };

  const handleUnsendClick = () => {
    if (message.id && isUser) {
      handleUnsendMessage(message.id);
    }
  };

  const currentContent = showTranslation && translations && translations[0]
    ? translations[0].content
    : content;

  const renderMessageContent = () => {
    if (isImage) {
      return (
        <div className="relative">
          <div className="rounded-lg overflow-hidden">
            <div className="w-[250px] h-[250px] relative overflow-hidden" onClick={e => e.stopPropagation()}>
              <img 
                src={content} 
                alt="Shared image" 
                className={`w-full h-full object-cover transition-all duration-300 ${isBlurred ? 'blur-xl' : ''}`}
                loading="lazy"
              />
              {isBlurred ? (
                <button 
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 dark:bg-black/60 p-2 rounded-full flex items-center gap-1"
                  onClick={handleToggleBlur}
                >
                  <Eye className="h-5 w-5 text-gray-700 dark:text-gray-200" />
                  <span className="text-gray-700 dark:text-gray-200 text-sm font-medium">Reveal</span>
                </button>
              ) : (
                <div className="absolute top-2 right-2 flex space-x-2">
                  <button 
                    className="bg-black/40 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity flex items-center gap-1 px-2"
                    onClick={handleToggleBlur}
                  >
                    <EyeOff className="h-4 w-4 text-white" />
                    <span className="text-white text-xs">Hide</span>
                  </button>
                  <button 
                    className="bg-black/40 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                    onClick={handleToggleFullscreen}
                  >
                    <Maximize className="h-4 w-4 text-white" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isFullScreen && (
            <div 
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
              onClick={handleCloseFullscreen}
            >
              <div className="relative max-w-4xl max-h-full">
                <img 
                  src={content} 
                  alt="Fullscreen image" 
                  className="max-w-full max-h-[90vh] object-contain"
                />
                <button 
                  className="absolute top-2 right-2 bg-white/20 p-2 rounded-full hover:bg-white/40 transition-colors"
                  onClick={handleCloseFullscreen}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>
            </div>
          )}
        </div>
      );
    } else if (isVoice && duration !== undefined) {
      return <VoiceMessagePlayer audioSrc={content} duration={duration} />;
    } else {
      return renderContentWithEmojis(currentContent);
    }
  };

  const renderReactions = () => {
    if (!reactions || reactions.length === 0) return null;
    
    const emojiCounts: Record<string, number> = {};
    reactions.forEach(reaction => {
      emojiCounts[reaction.emoji] = (emojiCounts[reaction.emoji] || 0) + 1;
    });
    
    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(emojiCounts).map(([emoji, count]) => (
          <div 
            key={emoji} 
            className="bg-gray-100 dark:bg-gray-700 rounded-full px-1.5 py-0.5 text-xs flex items-center"
          >
            <span>{emoji}</span>
            {count > 1 && <span className="ml-1 text-gray-500">{count}</span>}
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1.5`}>
        {replyToMessage && (
          <div className={`
            max-w-[80%] px-2 py-1 mb-1 text-xs bg-gray-100 dark:bg-gray-700 rounded-md
            border-l-2 border-gray-300 dark:border-gray-500
            ${isUser ? 'mr-2' : 'ml-2'}
          `}>
            <div className="font-medium text-gray-500 dark:text-gray-400">
              {replyToMessage.sender === 'user' ? 'You' : 'Reply to'}
            </div>
            <div className="truncate">
              {replyToMessage.isImage ? '📷 Image' : 
               replyToMessage.isVoice ? '🎤 Voice message' : 
               replyToMessage.content.substring(0, 30) + (replyToMessage.content.length > 30 ? '...' : '')}
            </div>
          </div>
        )}
        
        <div
          className={`
            relative px-3 py-2 rounded-2xl max-w-[80%]
            ${isUser 
              ? 'bg-teal-500 text-white rounded-br-none' 
              : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'}
            ${isVoice ? 'p-0 overflow-hidden min-w-[240px]' : ''}
          `}
        >
          {renderMessageContent()}

          {isVip && isBot && (
            <div className="absolute -bottom-5 right-0 flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleReplyClick}
              >
                <Reply className="h-3 w-3" />
              </Button>
              
              <Popover open={showReactionPopover} onOpenChange={setShowReactionPopover}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    <Smile className="h-3 w-3" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" side="top">
                  <EmojiPicker onEmojiSelect={handleReactClick} useBasicPicker={true} />
                </PopoverContent>
              </Popover>
            </div>
          )}

          {isVip && isUser && (
            <div className="absolute -bottom-5 left-0 flex space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={handleUnsendClick}
              >
                <Trash className="h-3 w-3" />
              </Button>
            </div>
          )}

          {isVip && !isImage && !isVoice && translations && translations.length > 0 && (
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`absolute bottom-0 right-0 p-1 rounded-full bg-white/20 -mb-1 -mr-1 ${showTranslation ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              <Globe className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {renderReactions()}
        
        {(isLastInGroup || isVip) && (
          <div className={`flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'mr-1' : 'ml-1'}`}>
            <span>{formattedTime}</span>
            {isUser && showStatus && <span className="ml-1">{getStatusIcon()}</span>}
            
            {isVip && isBot && !isImage && !isVoice && (
              <button 
                onClick={handleTranslate}
                className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                title="Translate message"
              >
                <Globe className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      <TranslateMessageDialog 
        isOpen={showTranslationDialog}
        onClose={() => setShowTranslationDialog(false)}
        onTranslate={handleTranslateConfirm}
      />
    </>
  );
};

export default React.memo(MessageBubble);
