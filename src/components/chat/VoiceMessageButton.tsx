
import React, { useState, useRef } from 'react';
import { Mic, MicOff, CirclePlay, X } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '@/hooks/use-toast';
import { MAX_VOICE_LENGTH } from '@/types/chat';

interface VoiceMessageButtonProps {
  onVoiceRecorded: (audioBlob: string, duration: number) => void;
  isVip: boolean;
  disabled?: boolean;
}

const VoiceMessageButton: React.FC<VoiceMessageButtonProps> = ({
  onVoiceRecorded,
  isVip,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const startRecording = async () => {
    if (!isVip) {
      toast({
        title: "VIP feature",
        description: "Voice messages are only available for VIP users."
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
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        
        // Convert to base64 for sending
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64data = reader.result as string;
          onVoiceRecorded(base64data, recordingTime);
        };
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        if (seconds >= MAX_VOICE_LENGTH) {
          stopRecording();
          toast({
            title: "Recording limit reached",
            description: "Voice messages are limited to 2 minutes."
          });
        }
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages."
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioUrl(null);
    setIsRecording(false);
    setRecordingTime(0);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  // Don't show for non-VIP users
  if (!isVip) return null;
  
  return (
    <>
      {isRecording ? (
        <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-full">
          <div className="flex-shrink-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs font-medium text-red-500">{formatTime(recordingTime)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-red-500"
            onClick={stopRecording}
            title="Stop recording"
          >
            <MicOff className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500"
            onClick={cancelRecording}
            title="Cancel recording"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : audioUrl ? (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500"
            onClick={() => {
              const audio = new Audio(audioUrl);
              audio.play();
            }}
            title="Play recording"
          >
            <CirclePlay className="h-4 w-4" />
          </Button>
          <span className="text-xs font-medium text-gray-500">{formatTime(recordingTime)}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-500"
            onClick={cancelRecording}
            title="Cancel"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
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
      )}
    </>
  );
};

export default VoiceMessageButton;
