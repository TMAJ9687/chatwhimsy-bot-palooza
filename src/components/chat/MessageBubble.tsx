
import React, { useState } from 'react';
import { Check, Clock, Eye, EyeOff, Maximize, X, Globe } from 'lucide-react';
import { Message as MessageType, MessageStatus } from '@/types/chat';
import { renderContentWithEmojis } from '@/utils/emojiUtils';
import VoiceMessagePlayer from './VoiceMessagePlayer';
import { useChat } from '@/context/ChatContext';
import { useUser } from '@/context/UserContext';
import TranslateMessageDialog from './TranslateMessageDialog';

export interface Message extends MessageType {}

interface MessageBubbleProps {
  message: Message;
  isLastInGroup?: boolean;
  showStatus?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLastInGroup = false,
  showStatus = true
}) => {
  const { sender, content, timestamp, status, isImage, isVoice, duration, translations } = message;
  const isUser = sender === 'user';
  const { isVip } = useUser();
  const { handleTranslateMessage } = useChat();
  
  const [isBlurred, setIsBlurred] = useState(isImage ? true : false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showTranslationDialog, setShowTranslationDialog] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  
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

  const currentContent = showTranslation && translations && translations[0]
    ? translations[0].content
    : content;

  // Render content based on message type
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
          
          {/* Fullscreen image modal */}
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

  return (
    <>
      <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} mb-1.5`}>
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

          {/* Translation toggle button - only show for text messages and VIP users */}
          {isVip && !isImage && !isVoice && translations && translations.length > 0 && (
            <button 
              onClick={() => setShowTranslation(!showTranslation)}
              className={`absolute bottom-0 right-0 p-1 rounded-full bg-white/20 -mb-1 -mr-1 ${showTranslation ? 'text-yellow-500' : 'text-gray-400'}`}
            >
              <Globe className="h-3 w-3" />
            </button>
          )}
        </div>
        
        {isLastInGroup && showStatus && (
          <div className={`flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'mr-1' : 'ml-1'}`}>
            <span>{formattedTime}</span>
            {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
            
            {/* Translation button - only show for text messages, not the user's own, and for VIP users */}
            {isVip && !isUser && !isImage && !isVoice && (
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

      {/* Translation dialog */}
      <TranslateMessageDialog 
        isOpen={showTranslationDialog}
        onClose={() => setShowTranslationDialog(false)}
        onTranslate={handleTranslateConfirm}
      />
    </>
  );
};

export default React.memo(MessageBubble);
