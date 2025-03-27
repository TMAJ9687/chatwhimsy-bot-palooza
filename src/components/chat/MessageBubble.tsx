
import React, { useState, useRef } from 'react';
import { Check, Clock, Eye, EyeOff, Maximize, X, CirclePlay, Pause } from 'lucide-react';
import { Message as MessageType, MessageStatus } from '@/types/chat';
import { renderContentWithEmojis } from '@/utils/emojiUtils';

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
  const { sender, content, timestamp, status, isImage, isVoice, duration } = message;
  const isUser = sender === 'user';
  
  const [isBlurred, setIsBlurred] = useState(isImage ? true : false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
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
  
  const togglePlayVoice = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(content);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };
  
  const formatDuration = (seconds: number = 0) => {
    if (!seconds) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  // Use our utility function for rendering content
  const renderContent = () => {
    if (isImage) return null;
    if (isVoice) return null;
    return renderContentWithEmojis(content);
  };

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
        ) : isVoice ? (
          <div className="flex items-center gap-2 py-1 min-w-[150px]">
            <button
              className={`flex-shrink-0 p-1.5 rounded-full ${isUser ? 'bg-white/20' : 'bg-teal-100 dark:bg-teal-800'}`}
              onClick={togglePlayVoice}
            >
              {isPlaying ? (
                <Pause className={`h-4 w-4 ${isUser ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
              ) : (
                <CirclePlay className={`h-4 w-4 ${isUser ? 'text-white' : 'text-teal-600 dark:text-teal-400'}`} />
              )}
            </button>
            <div className="flex flex-col">
              <div className={`text-xs font-medium ${isUser ? 'text-white/80' : 'text-gray-600 dark:text-gray-400'}`}>
                Voice message
              </div>
              <div className={`text-xs ${isUser ? 'text-white/60' : 'text-gray-500 dark:text-gray-500'}`}>
                {formatDuration(duration)}
              </div>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>
      
      {isLastInGroup && showStatus && (
        <div className={`flex items-center mt-0.5 text-xs text-gray-500 dark:text-gray-400 ${isUser ? 'mr-1' : 'ml-1'}`}>
          <span>{formattedTime}</span>
          {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageBubble);
