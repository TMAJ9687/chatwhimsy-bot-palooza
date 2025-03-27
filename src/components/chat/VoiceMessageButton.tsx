
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { useVipFeatures } from '@/hooks/useVipFeatures';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageButtonProps {
  onVoiceMessageReady: (audioBlob: Blob, durationInSeconds: number) => void;
  disabled?: boolean;
}

const VoiceMessageButton: React.FC<VoiceMessageButtonProps> = ({ 
  onVoiceMessageReady, 
  disabled = false 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const { hasFeature, getVoiceMessagesRemaining } = useVipFeatures();
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const maxRecordingTime = 120; // 2 minutes in seconds
  
  // Check if the browser supports voice recording
  const isBrowserSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  };
  
  // Clean up function for recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  // Cancel recording without saving
  const cancelRecording = () => {
    stopRecording();
    audioChunksRef.current = [];
    setRecordingTime(0);
  };
  
  // Effect to set up voice recording
  useEffect(() => {
    if (isRecording) {
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTime) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isRecording]);
  
  // Format seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  const startRecording = async () => {
    if (!isBrowserSupported()) {
      toast({
        title: "Browser not supported",
        description: "Your browser doesn't support voice recording.",
        duration: 3000
      });
      return;
    }
    
    // Check if VIP user has voice messages remaining
    const voiceMessagesRemaining = getVoiceMessagesRemaining();
    if (voiceMessagesRemaining <= 0) {
      toast({
        title: "Voice message limit reached",
        description: "You have used all your voice messages for today.",
        duration: 3000
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const trackDuration = recordingTime;
        onVoiceMessageReady(audioBlob, trackDuration);
        
        // Reset recording state
        setRecordingTime(0);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages.",
        duration: 3000
      });
    }
  };
  
  // If not a VIP feature, don't render the button
  if (!hasFeature('voiceMessages')) {
    return null;
  }
  
  if (isRecording) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-xs font-medium text-red-500 mr-1 min-w-[48px]">
          {formatTime(recordingTime)}
        </div>
        
        <Button 
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={cancelRecording}
          title="Cancel recording"
        >
          <Square className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="default"
          size="icon"
          className="h-8 w-8 bg-green-500 hover:bg-green-600"
          onClick={stopRecording}
          title="Stop recording"
          disabled={recordingTime < 1}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    );
  }
  
  return (
    <Button 
      variant="ghost" 
      size="icon"
      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
      onClick={startRecording}
      disabled={disabled}
      title="Record voice message"
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default VoiceMessageButton;
