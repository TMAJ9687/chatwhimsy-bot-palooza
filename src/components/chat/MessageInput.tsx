
import React, { useState, useRef } from 'react';
import { Send, Image, Smile, X } from 'lucide-react';
import Button from '../shared/Button';

interface MessageInputProps {
  onSendMessage: (content: string, isImage?: boolean) => void;
  disabled?: boolean;
  userType?: 'standard' | 'vip';
  imagesRemaining?: number;
  value?: string;
  onChange?: React.Dispatch<React.SetStateAction<string>>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

const MAX_CHARS = 120;

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  userType = 'standard',
  imagesRemaining = 15,
  value,
  onChange,
  onKeyDown,
  placeholder = "Type a message...",
  className
}) => {
  // Use internal state only if value and onChange aren't provided
  const [internalMessage, setInternalMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const message = value !== undefined ? value : internalMessage;
  const handleChange = onChange || setInternalMessage;

  const charCount = message.length;
  const isOverLimit = userType === 'standard' && charCount > MAX_CHARS;

  const handleSendMessage = () => {
    if (imagePreview) {
      onSendMessage(imagePreview, true);
      setImagePreview(null);
      return;
    }

    if (message.trim() && !isOverLimit) {
      onSendMessage(message);
      if (!onChange) {
        setInternalMessage('');
      }
    }
  };

  const handleKeyDownInternal = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    if (onKeyDown) {
      onKeyDown(e);
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

  const handleEmojiClick = () => {
    // For now just add a simple emoji
    handleChange(message + '😊');
  };

  const handleCancelImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border-t border-border dark:border-gray-700 p-3">
      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 object-contain rounded-lg border border-border dark:border-gray-700"
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            <button
              onClick={handleCancelImage}
              className="bg-white dark:bg-gray-800 rounded-full p-2 shadow-md hover:bg-muted dark:hover:bg-gray-700 transition-colors"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </button>
            <button
              onClick={handleSendMessage}
              className="bg-amber-500 rounded-full p-2 shadow-md hover:bg-amber-600 transition-colors text-white"
              title="Send image"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            className={`w-full rounded-2xl border border-border dark:border-gray-700 py-2 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[48px] max-h-32 ${isOverLimit ? 'border-red-500' : ''} ${className || ''}`}
            placeholder={placeholder}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDownInternal}
            disabled={disabled || !!imagePreview}
            rows={1}
            style={{paddingTop: '8px'}}
          />
          <div className="absolute right-3 bottom-2 flex items-center gap-2">
            <button
              className="text-muted-foreground hover:text-primary transition-colors"
              type="button"
              onClick={handleEmojiClick}
            >
              <Smile className="h-5 w-5" />
            </button>
            
            {userType === 'standard' && (
              <span className={`text-xs ${isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'}`}>
                {charCount}/{MAX_CHARS}
              </span>
            )}
          </div>
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        <Button
          variant="outline"
          size="sm"
          className="h-[48px] w-[48px] rounded-full p-0 flex items-center justify-center"
          onClick={triggerFileInput}
          disabled={disabled || imagesRemaining <= 0 || !!imagePreview}
          title={`${imagesRemaining} images remaining today`}
        >
          <Image className="h-5 w-5" />
        </Button>
        
        {!imagePreview && (
          <Button
            variant="primary"
            size="sm"
            className={`h-[48px] w-[48px] rounded-full p-0 flex items-center justify-center ${isOverLimit ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={handleSendMessage}
            disabled={disabled || (!message.trim() && !imagePreview) || isOverLimit}
          >
            <Send className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {userType === 'standard' && (
        <div className="mt-2 text-xs text-center text-muted-foreground border-t border-gray-200 dark:border-gray-700 pt-1">
          {imagesRemaining} images remaining today • Upgrade to VIP for unlimited images
        </div>
      )}
    </div>
  );
};

export default MessageInput;
