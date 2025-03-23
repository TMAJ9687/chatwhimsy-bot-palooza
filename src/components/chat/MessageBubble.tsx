
import React, { useState } from 'react';
import { Check, Clock, Eye, EyeOff, X, Maximize } from 'lucide-react';

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
  showStatus?: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ 
  message, 
  isLastInGroup = false,
  showStatus = true
}) => {
  const { sender, content, timestamp, status, isImage } = message;
  const isUser = sender === 'user';
  
  const [isBlurred, setIsBlurred] = useState(isImage ? true : false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
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

  const handleToggleBlur = () => {
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
          <div className="relative">
            <div 
              className="rounded-lg overflow-hidden cursor-pointer"
              onClick={isBlurred ? handleToggleBlur : handleToggleFullscreen}
            >
              <div className="w-[250px] h-[250px] relative overflow-hidden">
                <img 
                  src={content} 
                  alt="Shared image" 
                  className={`w-full h-full object-cover transition-all duration-300 ${isBlurred ? 'blur-xl' : ''}`}
                  loading="lazy"
                />
                {isBlurred && (
                  <button 
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
                    onClick={handleToggleBlur}
                  >
                    <Eye className="h-5 w-5 text-gray-700" />
                  </button>
                )}
                {!isBlurred && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button 
                      className="bg-black/40 p-1 rounded-full opacity-70 hover:opacity-100 transition-opacity"
                      onClick={handleToggleBlur}
                    >
                      <EyeOff className="h-4 w-4 text-white" />
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
        ) : (
          <div className="whitespace-pre-wrap break-words text-sm">{content}</div>
        )}
      </div>
      
      {isLastInGroup && showStatus && (
        <div className={`flex items-center mt-0.5 text-xs text-gray-500 ${isUser ? 'mr-1' : 'ml-1'}`}>
          <span>{formattedTime}</span>
          {getStatusIcon() && <span className="ml-1">{getStatusIcon()}</span>}
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageBubble);
