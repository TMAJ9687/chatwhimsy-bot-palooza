
import React, { useState, useRef, memo, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '../ui/button';
import { Image, Send, Smile } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  imagesRemaining: number;
  disabled?: boolean;
}

const MAX_CHAR_LIMIT = 120;
const CONSECUTIVE_LIMIT = 3;

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
  const { toast } = useToast();
  
  // Handle submitting message
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim() && !isExceedingLimit()) {
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

  // Check if message exceeds character limit
  const isExceedingLimit = () => {
    return !isVip && message.length > MAX_CHAR_LIMIT;
  };
  
  // Handle uploading image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if user has remaining uploads
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    // Check file type and size
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file."
      });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast({
        title: "File too large",
        description: "Image size should be less than 5MB."
      });
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
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  // Check for consecutive characters
  const hasConsecutiveChars = (text: string) => {
    if (!text) return false;
    
    for (let i = 0; i <= text.length - CONSECUTIVE_LIMIT; i++) {
      let isConsecutive = true;
      for (let j = 1; j < CONSECUTIVE_LIMIT; j++) {
        if (text[i] !== text[i + j]) {
          isConsecutive = false;
          break;
        }
      }
      if (isConsecutive) return true;
    }
    return false;
  };

  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Check if exceeding character limit (for non-VIP)
    if (!isVip && newText.length > MAX_CHAR_LIMIT) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${MAX_CHAR_LIMIT} characters. Upgrade to VIP for unlimited messaging.`,
        duration: 3000
      });
      setMessage(newText.slice(0, MAX_CHAR_LIMIT));
      return;
    }
    
    // Check for consecutive characters
    if (newText.length > message.length && hasConsecutiveChars(newText)) {
      toast({
        title: "Pattern detected",
        description: "Please avoid sending more than 3 consecutive identical characters.",
        duration: 3000
      });
      return;
    }
    
    setMessage(newText);
  };

  // Available emoji options
  const emojis = ["😊", "😂", "❤️", "👍", "😍", "🙏", "😘", "🥰", "😎", "🔥", "😁", "👋", "🤗", "🤔"];
  
  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    const newText = message + emoji;
    
    // Check if exceeding character limit
    if (!isVip && newText.length > MAX_CHAR_LIMIT) {
      toast({
        title: "Character limit reached",
        description: `Messages are limited to ${MAX_CHAR_LIMIT} characters. Upgrade to VIP for unlimited messaging.`,
        duration: 3000
      });
      return;
    }
    
    setMessage(newText);
  };

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

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
              disabled={disabled}
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <div className="flex flex-wrap gap-2 max-w-[200px]">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  className="w-8 h-8 flex items-center justify-center text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  onClick={() => handleEmojiClick(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        
        <div className="flex-1 relative">
          <textarea
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "You can't message a blocked user" : "Type a message..."}
            className={`w-full py-2 px-3 pr-16 bg-gray-100 dark:bg-gray-700 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none text-left h-10 max-h-24 leading-normal ${isExceedingLimit() ? 'border-red-500 border' : ''}`}
            style={{paddingTop: '6px', paddingBottom: '6px'}}
          />
          {!isVip && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isExceedingLimit() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {message.length}/{MAX_CHAR_LIMIT}
            </div>
          )}
        </div>
        
        <Button 
          size="icon"
          onClick={handleSubmitMessage}
          className={`
            rounded-full 
            ${message.trim() && !isExceedingLimit() ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
          `}
          disabled={!message.trim() || isExceedingLimit() || disabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1">
        {!isVip && `${imagesRemaining} image uploads remaining today - `}
        {isVip ? "VIP Member - Unlimited messaging and uploads" : "Upgrade to VIP for unlimited uploads"}
      </div>
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
