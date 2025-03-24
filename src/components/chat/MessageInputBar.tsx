import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Image as ImageIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Message } from './MessageBubble';
import { useUser } from '@/context/UserContext';
import VoiceMessageRecorder from './VoiceMessageRecorder';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage?: (imageDataUrl: string) => void;
  onSendVoice?: (audioUrl: string) => void;
  replyTo?: Message | null;
  onCancelReply?: () => void;
  imagesRemaining?: number;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendImage,
  onSendVoice,
  replyTo,
  onCancelReply,
  imagesRemaining = 0
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();
  const { isVip, userRole } = useUser();
  
  // Get max message length based on user type
  const MAX_MESSAGE_LENGTH = isVip ? 200 : 120;

  // Handle textarea resize when content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = 
        Math.min(textareaRef.current.scrollHeight, 150) + 'px';
    }
  }, [message]);

  // Focus textarea when reply is set
  useEffect(() => {
    if (replyTo && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyTo]);

  // Handle text input
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= MAX_MESSAGE_LENGTH) {
      setMessage(newValue);
    }
  };

  // Handle key press - send on Enter (without shift)
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle file selection for image upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if uploads are remaining
    if (imagesRemaining <= 0 && !isVip) {
      toast({
        title: "Upload limit reached",
        description: "You've used all your free image uploads. Upgrade to VIP for unlimited uploads.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Images must be smaller than 5MB.",
        variant: "destructive"
      });
      return;
    }
    
    // Read and preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Cancel image upload
  const handleCancelImage = () => {
    setPreviewImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Send the message
  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    
    // If we have an image preview, send it
    if (previewImage && onSendImage) {
      onSendImage(previewImage);
      setPreviewImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    // Otherwise send text message if not empty
    if (trimmedMessage) {
      setIsLoading(true);
      
      onSendMessage(trimmedMessage);
      
      setMessage('');
      setIsLoading(false);
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  // Handle sending voice message
  const handleSendVoice = (audioUrl: string) => {
    if (onSendVoice) {
      onSendVoice(audioUrl);
    }
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3">
      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center mb-2 py-1 px-3 bg-gray-100 dark:bg-gray-700 rounded-md">
          <div className="flex-1 flex items-center overflow-hidden">
            <span className="text-sm font-medium mr-2">
              Replying to {replyTo.isUser ? 'yourself' : replyTo.senderName}:
            </span>
            <p className="text-sm truncate text-muted-foreground">
              {replyTo.content}
            </p>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={onCancelReply}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      {/* Image preview */}
      {previewImage && (
        <div className="mb-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md relative">
          <img 
            src={previewImage} 
            alt="Preview" 
            className="max-h-40 rounded mx-auto"
          />
          <Button 
            variant="destructive" 
            size="sm" 
            className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
            onClick={handleCancelImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="flex items-end space-x-2">
        {/* Image upload button */}
        <Button
          variant="ghost"
          size="icon"
          disabled={isLoading || !onSendImage}
          onClick={() => fileInputRef.current?.click()}
          className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
        >
          <ImageIcon className="h-5 w-5" />
          {!isVip && imagesRemaining > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {imagesRemaining}
            </span>
          )}
        </Button>
        
        {/* Voice message recorder (VIP only) */}
        {isVip && onSendVoice && (
          <VoiceMessageRecorder onSendVoice={handleSendVoice} disabled={isLoading} />
        )}
        
        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />
        
        {/* Message input */}
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            placeholder="Type a message..."
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            rows={1}
            className="resize-none py-2 pl-3 pr-10 max-h-32 overflow-y-auto rounded-xl"
          />
          
          {/* Character counter */}
          <div className={`absolute bottom-2 right-3 text-xs ${
            message.length > MAX_MESSAGE_LENGTH * 0.8 
              ? 'text-amber-500' 
              : 'text-gray-400 dark:text-gray-500'
          }`}>
            {message.length}/{MAX_MESSAGE_LENGTH}
          </div>
        </div>
        
        {/* Send button */}
        <Button
          variant="default"
          size="icon"
          disabled={(!message.trim() && !previewImage) || isLoading}
          onClick={handleSendMessage}
          className="rounded-full h-10 w-10"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInputBar;
