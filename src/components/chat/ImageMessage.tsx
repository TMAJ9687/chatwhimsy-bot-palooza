
import React, { useState } from 'react';
import { Eye, EyeOff, Maximize, X } from 'lucide-react';

interface ImageMessageProps {
  content: string;
  onClose?: () => void;
}

const ImageMessage: React.FC<ImageMessageProps> = ({ content, onClose }) => {
  const [isBlurred, setIsBlurred] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);
  
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
    if (onClose) onClose();
  };
  
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
};

export default ImageMessage;
