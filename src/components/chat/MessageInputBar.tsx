
import React, { useState, useRef, memo } from 'react';
import { useChat } from '@/context/ChatContext';
import MessageInput from './MessageInput';
import { Button } from '../ui/button';
import { Image, Send, Smile } from 'lucide-react';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  imagesRemaining: number;
  disabled?: boolean;
}

const MAX_CHAR_LIMIT = 120;

const MessageInputBar: React.FC<MessageInputBarProps> = memo(({
  onSendMessage,
  onSendImage,
  imagesRemaining,
  disabled = false
}) => {
  // State variables
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isVip } = useChat();
  
  // Handle submitting message
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  // Handle pressing enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };
  
  // Handle uploading image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if user has remaining uploads
    if (imagesRemaining <= 0 && !isVip) {
      alert('You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images.');
      return;
    }
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Image size should be less than 5MB.');
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      onSendImage(result);
      
      // Reset the input to allow uploading the same file again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsDataURL(file);
  };
  
  // Open file selection dialog
  const handleClickUpload = () => {
    if (disabled) return;
    
    if (imagesRemaining <= 0 && !isVip) {
      alert('You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images.');
      return;
    }
    
    fileInputRef.current?.click();
  };

  // Handle emoji selection
  const handleEmojiClick = () => {
    // This would be implemented with a proper emoji picker
    // For now, we'll just add a smiley face
    setMessage(prev => prev + '😊');
  };

  const charCount = message.length;
  const isOverLimit = !isVip && charCount > MAX_CHAR_LIMIT;
  
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageUpload}
          disabled={disabled}
        />
        
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
          onClick={handleClickUpload}
          disabled={disabled}
          title={
            isVip 
              ? "Upload image" 
              : `Upload image (${imagesRemaining} remaining today)`
          }
        >
          <Image className="h-5 w-5" />
        </Button>

        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
          onClick={handleEmojiClick}
          disabled={disabled}
          title="Add emoji"
        >
          <Smile className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "You can't message a blocked user" : "Type a message..."}
            className={`w-full py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-left h-10 max-h-24 leading-normal ${isOverLimit ? 'border-red-500 border' : ''}`}
            style={{paddingTop: '6px', paddingBottom: '6px'}}
          />
          {!isVip && (
            <div className={`absolute right-3 bottom-1 text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {charCount}/{MAX_CHAR_LIMIT}
            </div>
          )}
        </div>
        
        <Button 
          size="icon"
          onClick={handleSubmitMessage}
          className={`
            rounded-full 
            ${message.trim() && !isOverLimit ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
          `}
          disabled={!message.trim() || isOverLimit || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {!isVip && (
        <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1">
          {imagesRemaining} image uploads remaining today - Upgrade to VIP for unlimited uploads
        </div>
      )}
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
