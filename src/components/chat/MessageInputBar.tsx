
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
  
  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
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
          className="text-gray-500 hover:text-gray-700" 
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
        
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "You can't message a blocked user" : "Type a message..."}
            className="w-full py-2 px-3 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
          />
        </div>
        
        <Button 
          size="icon"
          onClick={handleSubmitMessage}
          className={`
            rounded-full 
            ${message.trim() ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 text-gray-500'}
          `}
          disabled={!message.trim() || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {!isVip && (
        <div className="text-xs text-center mt-1 text-gray-500">
          {imagesRemaining} image uploads remaining today - Upgrade to VIP for unlimited uploads
        </div>
      )}
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
