
import React, { useState, useRef } from 'react';
import { Send, Image, Smile, X } from 'lucide-react';
import Button from '../shared/Button';
import { Textarea } from '../ui/textarea';

interface MessageInputProps {
  onSendMessage: (content: string, isImage?: boolean) => void;
  disabled?: boolean;
  userType?: 'standard' | 'vip';
  imagesRemaining?: number;
  // Add these new props to fix the type error
  value?: string;
  onChange?: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  placeholder?: string;
  className?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  userType = 'standard',
  imagesRemaining = 15,
  // Add new props with defaults
  value,
  onChange,
  onKeyDown,
  placeholder = "Type a message...",
  className = ""
}) => {
  // Use internal state only if no value prop is provided
  const [internalMessage, setInternalMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use either controlled or uncontrolled input based on props
  const message = value !== undefined ? value : internalMessage;
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalMessage(newValue);
    }
  };

  const handleSendMessage = () => {
    if (imagePreview) {
      onSendMessage(imagePreview, true);
      setImagePreview(null);
      return;
    }

    if (message.trim()) {
      onSendMessage(message);
      // Only clear internal state if uncontrolled
      if (!onChange) {
        setInternalMessage('');
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (onKeyDown) {
      onKeyDown(e);
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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

  return (
    <div className={`bg-white border-t border-border p-3 ${className}`}>
      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 object-contain rounded-lg border border-border"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-muted transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            className="w-full rounded-2xl border border-border py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[56px] max-h-32"
            placeholder={placeholder}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || !!imagePreview}
            rows={1}
          />
          <button
            className="absolute right-3 bottom-3 text-muted-foreground hover:text-primary transition-colors"
            type="button"
          >
            <Smile className="h-6 w-6" />
          </button>
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
          className="h-[56px] w-[56px] rounded-full p-0 flex items-center justify-center"
          onClick={triggerFileInput}
          disabled={disabled || imagesRemaining <= 0 || !!imagePreview}
          title={`${imagesRemaining} images remaining today`}
        >
          <Image className="h-5 w-5" />
        </Button>
        
        <Button
          variant="primary"
          size="sm"
          className="h-[56px] w-[56px] rounded-full p-0 flex items-center justify-center"
          onClick={handleSendMessage}
          disabled={disabled || (!message.trim() && !imagePreview)}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {userType === 'standard' && (
        <div className="mt-2 text-xs text-center text-muted-foreground">
          {imagesRemaining} images remaining today • Upgrade to VIP for unlimited images
        </div>
      )}
    </div>
  );
};

export default MessageInput;
