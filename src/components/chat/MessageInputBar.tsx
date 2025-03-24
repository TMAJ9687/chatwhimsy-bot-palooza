
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image as ImageIcon, X, Eye, EyeOff } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  imagesRemaining: number;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendImage,
  imagesRemaining
}) => {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('light');

  // Detect theme for emoji picker
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = () => {
    if (imagePreview) {
      onSendImage(imagePreview);
      setImagePreview(null);
      return;
    }

    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setImagePreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please select an image file');
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    setMessage(prev => prev + emoji.native);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-1 right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
    
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
        <input
          type="text"
          className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-200 py-2 text-sm"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={!!imagePreview}
        />
        
        <div className="text-xs text-gray-400 mr-2">
          {message.length}/120
        </div>
        
        <div className="relative">
          <button 
            ref={emojiButtonRef}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={toggleEmojiPicker}
          >
            <Smile className="h-5 w-5" />
          </button>
          
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-12 right-0 z-10"
            >
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme={theme}
                previewPosition="none"
              />
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <button
          className={`p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${imagesRemaining <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={triggerFileInput}
          disabled={imagesRemaining <= 0 || !!imagePreview}
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        
        <button
          className="ml-1 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
          onClick={handleSend}
          disabled={(!message.trim() && !imagePreview)}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      {/* Display images remaining */}
      {imagesRemaining < 10 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {imagesRemaining} images remaining today
        </div>
      )}
    </div>
  );
};

export default MessageInputBar;
