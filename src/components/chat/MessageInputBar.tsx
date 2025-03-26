import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image as ImageIcon, X } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { makeSerializable } from '@/utils/serialization';

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

  // Safely handle file changes to prevent DataCloneError
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Size check to prevent large files
    if (file.size > 3 * 1024 * 1024) { // 3MB limit for better performance
      alert('Image size should be less than 3MB');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Use FileReader with enhanced error handling
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        if (typeof reader.result === 'string') {
          // Compress the image if it's too large by creating a temporary canvas
          if (reader.result.length > 500000) { // If base64 is larger than ~500KB
            const img = new Image();
            img.onload = () => {
              try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Calculate new dimensions (max 1000px in any dimension)
                const maxSize = 1000;
                let width = img.width;
                let height = img.height;
                
                if (width > height && width > maxSize) {
                  height = (height * maxSize) / width;
                  width = maxSize;
                } else if (height > maxSize) {
                  width = (width * maxSize) / height;
                  height = maxSize;
                }
                
                // Set canvas size and draw resized image
                canvas.width = width;
                canvas.height = height;
                
                if (ctx) {
                  ctx.drawImage(img, 0, 0, width, height);
                  // Get compressed image as base64
                  const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
                  setImagePreview(compressedImage);
                } else {
                  // Fallback if canvas context isn't available
                  setImagePreview(reader.result);
                }
              } catch (err) {
                console.error('Error compressing image:', err);
                // Use original image if compression fails
                setImagePreview(reader.result);
              }
            };
            img.onerror = () => {
              console.error('Error loading image for compression');
              setImagePreview(reader.result);
            };
            img.src = reader.result;
          } else {
            // Use original image if it's small enough
            setImagePreview(reader.result);
          }
        } else {
          // Handle ArrayBuffer result by converting to string
          console.error('File read result is not a string but ArrayBuffer');
          setImagePreview(null);
        }
      } catch (error) {
        console.error('Error processing image:', error);
        setImagePreview(null);
      }
    };
    
    reader.onerror = () => {
      console.error('Error reading file');
      setImagePreview(null);
    };
    
    // Start reading the file
    try {
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error initiating file read:', error);
    }
    
    // Always clear the input value to ensure it can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleEmojiSelect = (emoji: { native: string }) => {
    try {
      // Ensure the emoji is serializable
      const safeEmoji = makeSerializable(emoji);
      setMessage(prev => prev + safeEmoji.native);
    } catch (error) {
      console.error('Error handling emoji:', error);
      // Fallback to a simple emoji if there's an issue
      setMessage(prev => prev + '😊');
    }
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  // Limit message length for better performance and serialization
  const MAX_MESSAGE_LENGTH = 500;
  
  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_MESSAGE_LENGTH) {
      setMessage(value);
    }
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
            type="button"
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
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
          disabled={!!imagePreview}
          maxLength={MAX_MESSAGE_LENGTH}
        />
        
        <div className="text-xs text-gray-400 mr-2">
          {message.length}/{MAX_MESSAGE_LENGTH}
        </div>
        
        <div className="relative">
          <button 
            ref={emojiButtonRef}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={toggleEmojiPicker}
            type="button"
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
          type="button"
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        
        <button
          className="ml-1 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
          onClick={handleSend}
          disabled={(!message.trim() && !imagePreview)}
          type="button"
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
