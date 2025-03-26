
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Image, Paperclip, Send, X, Trash2, Plus, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { checkCharacterLimit, hasConsecutiveChars, MAX_CHAR_LIMIT, VIP_CHAR_LIMIT } from '@/utils/messageUtils';
import { Message } from '@/types/chat';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  onSendVoiceMessage?: (audioBlob: Blob) => void;
  onSendGif?: (gifUrl: string) => void;
  imagesRemaining: number;
  voiceMessagesRemaining: number;
  disabled?: boolean;
  userType: 'standard' | 'vip';
  replyTo?: Message | null;
  onCancelReply?: () => void;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendImage,
  onSendVoiceMessage,
  onSendGif,
  imagesRemaining,
  voiceMessagesRemaining,
  disabled = false,
  userType = 'standard',
  replyTo,
  onCancelReply
}) => {
  const [message, setMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isShowingAttachments, setIsShowingAttachments] = useState(false);
  const isVip = userType === 'vip';
  const charLimit = isVip ? VIP_CHAR_LIMIT : MAX_CHAR_LIMIT;
  
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  
  // Focus textarea when replyTo changes
  useEffect(() => {
    if (replyTo && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [replyTo]);

  const handleSendMessage = () => {
    const trimmedMessage = message.trim();
    
    if (trimmedMessage === '') return;
    
    if (!checkCharacterLimit(trimmedMessage, isVip)) {
      return; // Message exceeded the character limit
    }
    
    if (hasConsecutiveChars(trimmedMessage, isVip)) {
      toast({
        title: "Message contains too many consecutive characters",
        description: isVip 
          ? "Even as VIP, please avoid excessive repeating characters." 
          : "Please avoid repeating the same character. Upgrade to VIP for more flexibility.",
        duration: 5000
      });
      return;
    }
    
    // Send the message
    onSendMessage(trimmedMessage);
    setMessage('');
    
    // Reset replyTo if we were replying
    if (replyTo && onCancelReply) {
      onCancelReply();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if user has remaining uploads
    if (!isVip && imagesRemaining <= 0) {
      toast({
        title: "Upload limit reached",
        description: "You've used all your daily image uploads. Upgrade to VIP for unlimited images.",
        duration: 5000
      });
      return;
    }
    
    // Max file size 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB",
        duration: 3000
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageDataUrl = event.target?.result as string;
      onSendImage(imageDataUrl);
      setIsShowingAttachments(false);
    };
    reader.readAsDataURL(file);
  };

  const handleGifUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isVip || !onSendGif) return;
    
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Make sure it's a GIF
    if (file.type !== 'image/gif') {
      toast({
        title: "Invalid file type",
        description: "Please select a GIF file",
        duration: 3000
      });
      return;
    }
    
    // Max file size 8MB
    if (file.size > 8 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum GIF size is 8MB",
        duration: 3000
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const gifDataUrl = event.target?.result as string;
      onSendGif(gifDataUrl);
      setIsShowingAttachments(false);
    };
    reader.readAsDataURL(file);
  };

  const startRecording = async () => {
    if (!isVip || !onSendVoiceMessage) return;
    
    if (!isVip && voiceMessagesRemaining <= 0) {
      toast({
        title: "Voice message limit reached",
        description: "You've used all your daily voice messages. Upgrade to VIP for unlimited voice messages.",
        duration: 5000
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Stop recording after 2 minutes
          if (newTime >= 120) {
            stopRecording();
          }
          return newTime;
        });
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to send voice messages",
        duration: 5000
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        recordedChunksRef.current = [];
        setIsRecording(false);
        
        // Send the voice message
        if (onSendVoiceMessage) {
          onSendVoiceMessage(audioBlob);
        }
      };
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      // Stop all audio tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      
      // Stop timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      mediaRecorderRef.current.stop();
      recordedChunksRef.current = [];
      setIsRecording(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-2">
      {/* Reply preview */}
      {replyTo && (
        <div className="flex items-center mb-2 mx-2 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">
          <div className="flex-1 overflow-hidden">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Replying to {replyTo.sender === 'user' ? 'yourself' : 'message'}:
            </div>
            <div className="text-sm truncate">
              {replyTo.content.length > 50 
                ? replyTo.content.substring(0, 50) + '...' 
                : replyTo.content}
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-5 w-5" 
            onClick={onCancelReply}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
      
      {isRecording ? (
        <div className="flex items-center justify-between bg-red-50 dark:bg-red-900/20 rounded-md p-2">
          <div className="flex items-center">
            <div className="h-3 w-3 rounded-full bg-red-500 mr-2 animate-pulse"></div>
            <span className="text-red-600 dark:text-red-400">Recording {formatTime(recordingTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              className="text-red-600 dark:text-red-400"
              onClick={cancelRecording}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={stopRecording}
            >
              <Send className="mr-1 h-4 w-4" />
              Send
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <textarea
              ref={textAreaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={disabled ? "You can't send messages to this user" : "Type a message..."}
              disabled={disabled}
              className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none min-h-[42px] max-h-32 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              rows={1}
              maxLength={charLimit}
            />
            
            <div className="absolute right-2 bottom-2">
              <div className="text-xs text-gray-400 text-right">
                {message.length > 0 && `${message.length}/${charLimit}`}
              </div>
            </div>
          </div>
          
          {/* Attachment button */}
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 rounded-full"
              onClick={() => setIsShowingAttachments(!isShowingAttachments)}
              disabled={disabled}
            >
              {isShowingAttachments ? <X className="h-5 w-5" /> : <Paperclip className="h-5 w-5" />}
            </Button>
            
            {/* Attachment options */}
            {isShowingAttachments && (
              <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="p-2 flex flex-col space-y-2">
                  <div className="flex items-center">
                    <label className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full">
                      <Image className="h-5 w-5 mr-2 text-blue-500" />
                      <span>Image {!isVip && `(${imagesRemaining} left)`}</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={!isVip && imagesRemaining <= 0}
                      />
                    </label>
                  </div>
                  
                  {isVip && onSendGif && (
                    <div className="flex items-center">
                      <label className="flex items-center p-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md w-full">
                        <Smile className="h-5 w-5 mr-2 text-amber-500" />
                        <span>GIF</span>
                        <input
                          type="file"
                          accept="image/gif"
                          className="hidden"
                          onChange={handleGifUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Voice recording button */}
          {isVip && onSendVoiceMessage && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-red-500 rounded-full"
              onClick={startRecording}
              disabled={disabled}
            >
              <Mic className="h-5 w-5" />
            </Button>
          )}
          
          {/* Send button */}
          <Button
            type="button"
            className="bg-teal-500 hover:bg-teal-600 text-white rounded-full px-3 py-1 flex items-center justify-center"
            onClick={handleSendMessage}
            disabled={message.trim() === '' || disabled}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default MessageInputBar;
