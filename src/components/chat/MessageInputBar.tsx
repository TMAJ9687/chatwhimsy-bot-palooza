
import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Image as ImageIcon, X, Mic, MicOff } from 'lucide-react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { useUser } from '@/context/UserContext';

interface MessageInputBarProps {
  onSendMessage: (text: string) => void;
  onSendImage: (imageDataUrl: string) => void;
  onSendVoice?: (audioBlob: Blob) => void;
  imagesRemaining: number;
}

const MessageInputBar: React.FC<MessageInputBarProps> = ({
  onSendMessage,
  onSendImage,
  onSendVoice,
  imagesRemaining
}) => {
  const { isVip, user } = useUser();
  const [message, setMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingData, setRecordingData] = useState<Blob | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [theme, setTheme] = useState('light');
  
  // For voice recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  // VIP settings
  const maxMessageLength = isVip ? 200 : 120;
  const maxRecordingTime = 120; // 2 minutes in seconds

  // Detect theme for emoji picker
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    setTheme(isDarkMode ? 'dark' : 'light');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setTheme(isDark ? 'dark' : 'light');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current && 
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current && 
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (recordingData) {
      if (onSendVoice) {
        onSendVoice(recordingData);
      }
      setRecordingData(null);
      return;
    }
    
    if (imagePreview) {
      onSendImage(imagePreview);
      setImagePreview(null);
      return;
    }

    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
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

  const handleEmojiSelect = (emoji: { native: string }) => {
    if (message.length + emoji.native.length <= maxMessageLength) {
      setMessage(prev => prev + emoji.native);
    }
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setRecordingData(audioBlob);
        
        // Clean up the stream
        stream.getTracks().forEach(track => track.stop());
        
        // Reset timer
        if (recordingTimerRef.current) {
          window.clearInterval(recordingTimerRef.current);
          recordingTimerRef.current = null;
        }
      };
      
      // Start recording
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      setRecordingTime(0);
      
      // Start timer
      recordingTimerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          
          // Auto-stop if max time reached
          if (newTime >= maxRecordingTime) {
            stopRecording();
          }
          
          return newTime;
        });
      }, 1000);
      
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      
      // Discard the data
      setRecordingData(null);
      setIsRecording(false);
      
      if (recordingTimerRef.current) {
        window.clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };
  
  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {imagePreview && (
        <div className="mb-3 relative">
          <img
            src={imagePreview}
            alt="Preview"
            className="h-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
          />
          <button
            onClick={() => setImagePreview(null)}
            className="absolute top-1 right-1 bg-white dark:bg-gray-900 rounded-full p-1 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
      )}
      
      {recordingData && (
        <div className="mb-3 relative">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-100 dark:border-blue-800 flex items-center">
            <div className="flex-1">
              <p className="font-medium text-sm">Voice message ready to send</p>
              <audio className="mt-2 w-full" controls src={URL.createObjectURL(recordingData)} />
            </div>
            <button
              onClick={() => setRecordingData(null)}
              className="p-1 bg-white dark:bg-gray-800 rounded-full shadow-sm ml-2"
            >
              <X className="h-4 w-4 text-red-500" />
            </button>
          </div>
        </div>
      )}
      
      {isRecording && (
        <div className="mb-3 bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-100 dark:border-red-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="animate-pulse mr-2">
                <div className="h-3 w-3 bg-red-500 rounded-full"></div>
              </div>
              <p className="font-medium text-red-700 dark:text-red-300">Recording voice message...</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-red-700 dark:text-red-300">
                {formatRecordingTime(recordingTime)}
              </span>
              <button
                onClick={cancelRecording}
                className="p-1 bg-white dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-red-500" />
              </button>
              <button
                onClick={stopRecording}
                className="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Stop
              </button>
            </div>
          </div>
          <div className="mt-2 w-full bg-red-200 dark:bg-red-800 rounded-full h-1.5">
            <div 
              className="bg-red-500 h-1.5 rounded-full" 
              style={{ width: `${(recordingTime / maxRecordingTime) * 100}%` }}
            ></div>
          </div>
        </div>
      )}
    
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-1">
        <input
          type="text"
          className="flex-1 bg-transparent border-0 focus:outline-none text-gray-700 dark:text-gray-200 py-2 text-sm"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => {
            const newValue = e.target.value;
            if (newValue.length <= maxMessageLength) {
              setMessage(newValue);
            }
          }}
          onKeyDown={handleKeyDown}
          disabled={!!imagePreview || !!recordingData || isRecording}
        />
        
        <div className={`text-xs ${message.length > maxMessageLength * 0.8 ? 'text-amber-500' : 'text-gray-400'}`}>
          {message.length}/{maxMessageLength}
        </div>
        
        <div className="relative">
          <button 
            ref={emojiButtonRef}
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={toggleEmojiPicker}
            disabled={isRecording}
          >
            <Smile className="h-5 w-5" />
          </button>
          
          {showEmojiPicker && (
            <div 
              ref={emojiPickerRef}
              className="absolute bottom-12 right-0 z-10"
            >
              <Picker 
                data={data} 
                onEmojiSelect={handleEmojiSelect}
                theme={theme}
                previewPosition="none"
              />
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {isVip && !isRecording && !recordingData && (
          <button
            className="p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            onClick={startRecording}
            disabled={!!imagePreview || isRecording || !!recordingData}
          >
            <Mic className="h-5 w-5" />
          </button>
        )}
        
        <button
          className={`p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 ${(!isVip && imagesRemaining <= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={triggerFileInput}
          disabled={(!isVip && imagesRemaining <= 0) || !!imagePreview || isRecording || !!recordingData}
        >
          <ImageIcon className="h-5 w-5" />
        </button>
        
        <button
          className="ml-1 w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center disabled:opacity-50"
          onClick={handleSend}
          disabled={(!message.trim() && !imagePreview && !recordingData) || isRecording}
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      
      {/* Display images remaining for non-VIP users */}
      {!isVip && imagesRemaining < 10 && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
          {imagesRemaining} images remaining today
        </div>
      )}
    </div>
  );
};

export default MessageInputBar;
