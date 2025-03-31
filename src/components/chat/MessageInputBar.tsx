
import React, { useState, useRef, memo } from 'react';
import { useChat } from '@/context/ChatContext';
import { checkCharacterLimit } from '@/utils/messageUtils';
import ImagePreview from './ImagePreview';
import ImageUploadButton from './ImageUploadButton';
import EmojiButton from './EmojiButton';
import MessageTextarea from './MessageTextarea';
import SendButton from './SendButton';
import VipStatusBar from './VipStatusBar';
import VoiceMessageButton from './VoiceMessageButton';
import { X } from 'lucide-react';
import { uploadDataURLImage } from '@/firebase/storage';
import { useUser } from '@/context/UserContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  onSendVoice?: (voiceDataUrl: string, duration: number) => void;
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
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const { isVip, replyingToMessage, setReplyingToMessage } = useChat();
  const { user } = useUser();
  const isMobile = useIsMobile();
  
  // Use the proper VIP status - from props first, then context
  const isUserVip = userType === 'vip' || isVip;
  
  const handleSubmitMessage = () => {
    if (disabled) return;
    
    if (message.trim() && checkCharacterLimit(message, isUserVip)) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };
  
  const handleSendImage = async () => {
    if (disabled || !imagePreview) return;
    
    try {
      // First send the image in the chat (for immediate feedback)
      onSendImage(imagePreview);
      
      // Then upload to Firebase Storage in the background
      if (user?.id) {
        await uploadDataURLImage(imagePreview, isUserVip);
      }
      
      setImagePreview(null);
    } catch (error) {
      console.error('Error sending image:', error);
      // We still clear the preview since the message was already sent in the chat
      setImagePreview(null);
    }
  };
  
  const handleEmojiClick = (emoji: string) => {
    const newText = message + emoji;
    
    if (!checkCharacterLimit(newText, isUserVip)) {
      return;
    }
    
    setMessage(newText);
  };

  const handleVoiceMessageReady = (audioBlob: Blob, duration: number) => {
    if (disabled || !onSendVoice) return;
    
    // Only VIP users can send voice messages
    if (!isUserVip) return;
    
    // Convert blob to data URL
    const reader = new FileReader();
    reader.readAsDataURL(audioBlob);
    reader.onloadend = () => {
      const base64data = reader.result as string;
      onSendVoice(base64data, duration);
    };
    
    setIsRecordingVoice(false);
  };

  const handleCancelReply = () => {
    setReplyingToMessage(null);
  };

  const isMessageValid = message.trim() && (isUserVip || message.length <= 500);

  return (
    <div className={`border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${disabled ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Reply preview - only for VIP users */}
      {isUserVip && replyingToMessage && (
        <div className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border-l-2 border-teal-500 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              {replyingToMessage.sender === 'user' ? 'Replying to yourself' : 'Replying to message'}
            </span>
            <span className="text-sm truncate max-w-[300px]">
              {replyingToMessage.isImage ? '📷 Image' : 
               replyingToMessage.isVoice ? '🎤 Voice message' : 
               replyingToMessage.content?.substring(0, 30) || replyingToMessage.text?.substring(0, 30) || '' + (
                 (replyingToMessage.content?.length || replyingToMessage.text?.length || 0) > 30 ? '...' : ''
               )}
            </span>
          </div>
          <button 
            onClick={handleCancelReply}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
      
      {imagePreview && (
        <ImagePreview 
          src={imagePreview} 
          onCancel={() => setImagePreview(null)}
          onSend={handleSendImage}
        />
      )}

      <div className="flex items-center gap-2 p-3">
        <ImageUploadButton 
          onImageSelected={setImagePreview}
          imagesRemaining={imagesRemaining}
          isVip={isUserVip}
          disabled={disabled || !!imagePreview || isRecordingVoice}
        />
        
        {/* Only render voice message button for VIP users */}
        {isUserVip && (
          <VoiceMessageButton 
            onVoiceMessageReady={handleVoiceMessageReady}
            disabled={disabled || !!imagePreview}
          />
        )}
        
        <EmojiButton 
          onEmojiSelect={handleEmojiClick}
          disabled={disabled || !!imagePreview || isRecordingVoice}
        />
        
        <MessageTextarea 
          message={message}
          onChange={setMessage}
          onSubmit={handleSubmitMessage}
          isVip={isUserVip}
          disabled={disabled || !!imagePreview || isRecordingVoice}
        />
        
        {!imagePreview && !isRecordingVoice && (
          <SendButton 
            onClick={handleSubmitMessage}
            disabled={!isMessageValid || disabled}
          />
        )}
      </div>
      
      <VipStatusBar 
        isVip={isUserVip} 
        imagesRemaining={imagesRemaining} 
      />
    </div>
  );
});

MessageInputBar.displayName = 'MessageInputBar';

export default MessageInputBar;
