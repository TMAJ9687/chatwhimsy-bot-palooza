
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Camera, Smile, X, Lock } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MessageInput from './MessageInput';
import { Button } from '../ui/button';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  imagesRemaining: number;
  isBlocked?: boolean;
}

// Optimized implementation with fewer re-renders
const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendImage,
  imagesRemaining,
  isBlocked = false
}) => {
  const [message, setMessage] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Clean file input on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);
  
  // Handle file selection from input
  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (file) {
      if (file.type.startsWith('image/')) {
        // Use URL.createObjectURL for better performance
        const fileUrl = URL.createObjectURL(file);
        setPreviewImage(fileUrl);
      } else {
        alert('Please select an image file');
      }
    }
    
    // Reset the input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);
  
  // Handle file selection button click
  const handleFileButtonClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);
  
  // Clear preview image
  const handleClearPreview = useCallback(() => {
    if (previewImage) {
      URL.revokeObjectURL(previewImage);
      setPreviewImage(null);
    }
  }, [previewImage]);
  
  // Handle message sending
  const handleSendMessage = useCallback(() => {
    if (previewImage) {
      onSendImage(previewImage);
      setPreviewImage(null);
    } else if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
    
    // Close emoji picker if open
    setShowEmojiPicker(false);
  }, [message, previewImage, onSendMessage, onSendImage]);
  
  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);
  
  // Handle emoji selection from picker
  const handleEmojiSelect = useCallback((emoji: any) => {
    setMessage(prev => prev + emoji.native);
  }, []);
  
  return (
    <div className="p-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      {/* Preview area only shown when an image is selected */}
      {previewImage && (
        <div className="p-2 mb-2 border border-gray-200 dark:border-gray-700 rounded-md relative">
          <img
            src={previewImage}
            alt="Selected"
            className="max-h-40 rounded-md mx-auto"
          />
          <button
            className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
            onClick={handleClearPreview}
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {/* Main input area */}
      <div className="flex items-end gap-2">
        {/* File input (hidden) */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          aria-label="Upload image"
        />
        
        {/* Image upload button */}
        <Button
          size="icon"
          variant="ghost"
          onClick={handleFileButtonClick}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          type="button"
          disabled={isBlocked || imagesRemaining <= 0}
          title={imagesRemaining <= 0 ? "Image upload limit reached" : "Upload image"}
        >
          <Camera className="h-5 w-5" />
        </Button>
        
        {/* Emoji picker */}
        <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              type="button"
              disabled={isBlocked}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0 border-none shadow-xl" align="end">
            <Picker
              data={data}
              onEmojiSelect={handleEmojiSelect}
              theme="light"
              previewPosition="none"
              skinTonePosition="none"
            />
          </PopoverContent>
        </Popover>
        
        {/* Text input area */}
        {isBlocked ? (
          <div className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-100 dark:bg-gray-800 text-gray-500 flex items-center">
            <Lock className="h-4 w-4 mr-2" />
            <span>You can't message this user because they are blocked</span>
          </div>
        ) : (
          <MessageInput
            value={message}
            onChange={setMessage}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1"
          />
        )}
        
        {/* Send button */}
        <Button
          size="icon"
          onClick={handleSendMessage}
          disabled={isBlocked || (!message.trim() && !previewImage)}
          className="bg-blue-500 hover:bg-blue-600 text-white"
          type="button"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {/* Show remaining uploads count */}
      {imagesRemaining < IMAGE_UPLOAD_LIMIT && (
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-right">
          {imagesRemaining} image {imagesRemaining === 1 ? 'upload' : 'uploads'} remaining
        </div>
      )}
    </div>
  );
};

// Add IMAGE_UPLOAD_LIMIT
const IMAGE_UPLOAD_LIMIT = 5;

export default React.memo(MessageInputBar);
