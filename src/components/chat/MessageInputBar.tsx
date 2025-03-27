
import React, { useState, useRef, memo, useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { Button } from '../ui/button';
import { Image, Send, Smile, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  STANDARD_CHAR_LIMIT, 
  VIP_CHAR_LIMIT, 
  validateImageFile, 
  checkCharacterLimit, 
  hasConsecutiveChars 
} from '@/utils/messageUtils';
import { useUser } from '@/context/UserContext';
import ImagePreview from './ImagePreview';
import EmojiPicker from './EmojiPicker';
import VoiceRecorder from './VoiceRecorder';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  imagesRemaining: number;
  disabled?: boolean;
  userType?: 'standard' | 'vip';
}

const MessageInputBar: React.FC<MessageInputBarProps> = memo(({
  onSendMessage,
  onSendImage,
  onSendVoice,
  imagesRemaining,
  disabled = false,
  userType = 'standard'
}) => {
  // State variables
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isVip } = useUser();
  const { toast } = useToast();
  
  // Use the passed userType prop or context
  const isUserVip = userType === 'vip' || isVip;
  const charLimit = isUserVip ? VIP_CHAR_LIMIT : STANDARD_CHAR_LIMIT;
  
  // Handle submitting message
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim() && !isExceedingLimit()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  // Handle sending image
  const handleSendImage = () => {
    if (disabled || !imagePreview) return;
    
    onSendImage(imagePreview);
    setImagePreview(null);
    // Reset the input to allow uploading the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Handle sending voice message
  const handleSendVoice = (audioBlob: Blob) => {
    if (disabled || !onSendVoice) return;
    
    onSendVoice(audioBlob);
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
    return message.length > charLimit;
  };
  
  // Handle uploading image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if user has remaining uploads (only for non-VIP)
    if (imagesRemaining <= 0 && !isUserVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    // Validate file
    const validation = validateImageFile(file, isUserVip);
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
  
  // Cancel image upload
  const handleCancelImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  // Open file selection dialog
  const handleClickUpload = () => {
    if (disabled) return;
    
    // Check if user has remaining uploads (only for non-VIP)
    if (imagesRemaining <= 0 && !isUserVip) {
      toast({
        title: "Upload limit reached",
        description: "You have reached your daily image upload limit. Upgrade to VIP to upload unlimited images."
      });
      return;
    }
    
    fileInputRef.current?.click();
  };

  // Handle message input
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    
    // Check if exceeding character limit
    if (!checkCharacterLimit(newText, isUserVip, true)) {
      setMessage(newText.slice(0, charLimit));
      return;
    }
    
    // Check for consecutive characters
    if (newText.length > message.length && hasConsecutiveChars(newText, isUserVip)) {
      toast({
        title: "Pattern detected",
        description: isUserVip 
          ? "Please avoid sending messages with excessive repetition."
          : "Please avoid sending more than 3 consecutive identical characters.",
        duration: 3000
      });
      return;
    }
    
    setMessage(newText);
  };

  // Handle emoji selection
  const handleEmojiClick = (emoji: string) => {
    const newText = message + emoji;
    
    // Check if exceeding character limit
    if (!checkCharacterLimit(newText, isUserVip, true)) {
      return;
    }
    
    setMessage(newText);
  };

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
          accept={isUserVip ? "image/*" : "image/jpeg, image/png, image/webp"}
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
              ? "Upload image or GIF" 
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
          <PopoverContent className="w-auto p-0" align="start">
            <EmojiPicker onEmojiSelect={handleEmojiClick} />
          </PopoverContent>
        </Popover>
        
        {/* Voice recorder for VIP users */}
        {isUserVip && onSendVoice && (
          <VoiceRecorder 
            onSendVoice={handleSendVoice}
            disabled={disabled || !!imagePreview}
          />
        )}
        
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
          <div className={`absolute right-3 top-1/2 -translate-y-1/2 text-xs ${isExceedingLimit() ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
            {message.length}/{charLimit}
          </div>
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
