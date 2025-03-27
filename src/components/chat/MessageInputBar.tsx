import React, { useState, useRef, memo, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '../ui/button';
import { Image, Send, Smile, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { MAX_CHAR_LIMIT, CONSECUTIVE_LIMIT, validateImageFile, checkCharacterLimit, hasConsecutiveChars } from '@/utils/messageUtils';
import ImagePreview from './ImagePreview';
import EmojiPicker from './EmojiPicker';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  imagesRemaining: number;
  disabled?: boolean;
  userType?: 'standard' | 'vip';
}

const MessageInputBar: React.FC<MessageInputBarProps> = memo(({
  onSendMessage,
  onSendImage,
  imagesRemaining,
  disabled = false,
  userType = 'standard'
}) => {
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isVip } = useChat();
  const { toast } = useToast();
  
  const isUserVip = userType === 'vip' || isVip;
  
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim() && !isExceedingLimit()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleSendImage = () => {
    if (disabled || !imagePreview) return;
    
    onSendImage(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitMessage();
    }
  };

  const isExceedingLimit = () => {
    return !isUserVip && message.length > MAX_CHAR_LIMIT;
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (imagesRemaining <= 0 && !isUserVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: "Invalid file",
        description: validation.message
      });
      return;
    }
    
    const reader = new FileReader();
    
    reader.onloadend = () => {
      const result = reader.result as string;
      setImagePreview(result);
    };
    
    reader.readAsDataURL(file);
  };
  
  const handleCancelImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClickUpload = () => {
    if (disabled) return;
    
    if (imagesRemaining <= 0 && !isUserVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    if (!checkCharacterLimit(newText, isUserVip, true)) {
      setMessage(newText.slice(0, MAX_CHAR_LIMIT));
      return;
    }
    
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

  const handleEmojiClick = (emoji: string) => {
    const newText = message + emoji;
    
    if (!checkCharacterLimit(newText, isUserVip, true)) {
      return;
    }
    
    setMessage(newText);
  };

  const emojis = ["😊", "😂", "❤️", "👍", "😍", "🙏", "😘", "🥰", "😎", "🔥", "😁", "👋", "🤗", "🤔"];

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {imagePreview && (
        <ImagePreview 
          src={imagePreview} 
          onCancel={handleCancelImage} 
          onSend={handleSendImage}
        />
      )}

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
          disabled={disabled || !!imagePreview}
          title={
            isUserVip 
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
              disabled={disabled || !!imagePreview}
              title="Add emoji"
            >
              <Smile className="h-5 w-5" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-2" align="start">
            <EmojiPicker onEmojiSelect={handleEmojiClick} />
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
            disabled={disabled || !!imagePreview}
          />
          {!isUserVip && (
            <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isExceedingLimit() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
              {message.length}/{MAX_CHAR_LIMIT}
            </div>
          )}
        </div>
        
        {!imagePreview && (
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
        )}
      </div>
      
      <div className="text-xs text-center mt-1 text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 pt-1">
        {!isUserVip && `${imagesRemaining} image uploads remaining today - `}
        {isUserVip ? "VIP Member - Unlimited messaging and uploads" : "Upgrade to VIP for unlimited uploads"}
      </div>
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
