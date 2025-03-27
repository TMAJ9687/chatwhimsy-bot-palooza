
import React, { useState, useRef, memo } from 'react';
import { useChat } from '@/context/ChatContext';
import { MAX_CHAR_LIMIT, checkCharacterLimit } from '@/utils/messageUtils';
import ImagePreview from './ImagePreview';
import ImageUploadButton from './ImageUploadButton';
import EmojiButton from './EmojiButton';
import MessageTextarea from './MessageTextarea';
import SendButton from './SendButton';
import VipStatusBar from './VipStatusBar';

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
  const { isVip } = useChat();
  
  const isUserVip = userType === 'vip' || isVip;
  
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim() && checkCharacterLimit(message, isUserVip, false)) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleSendImage = () => {
    if (disabled || !imagePreview) return;
    
    onSendImage(imagePreview);
    setImagePreview(null);
  };
  
  const handleEmojiClick = (emoji: string) => {
    const newText = message + emoji;
    
    if (!checkCharacterLimit(newText, isUserVip, true)) {
      return;
    }
    
    setMessage(newText);
  };

  const isMessageValid = message.trim() && (isUserVip || message.length <= MAX_CHAR_LIMIT);

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 p-3 bg-white dark:bg-gray-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {imagePreview && (
        <ImagePreview 
          src={imagePreview} 
          onCancel={() => setImagePreview(null)}
          onSend={handleSendImage}
        />
      )}

      <div className="flex items-center gap-2">
        <ImageUploadButton 
          onImageSelected={setImagePreview}
          imagesRemaining={imagesRemaining}
          isVip={isUserVip}
          disabled={disabled || !!imagePreview}
        />
        
        <EmojiButton 
          onEmojiSelect={handleEmojiClick}
          disabled={disabled || !!imagePreview}
        />
        
        <MessageTextarea 
          message={message}
          onChange={setMessage}
          onSubmit={handleSubmitMessage}
          isVip={isUserVip}
          disabled={disabled || !!imagePreview}
        />
        
        {!imagePreview && (
          <SendButton 
            onClick={handleSubmitMessage}
            disabled={!isMessageValid || disabled}
          />
        )}
      </div>
      
      <VipStatusBar isVip={isUserVip} imagesRemaining={imagesRemaining} />
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
