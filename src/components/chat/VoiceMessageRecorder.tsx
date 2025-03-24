
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, Square, Clock, Send, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VoiceMessageRecorderProps {
  onSendVoice: (audioBlob: string) => void;
  disabled?: boolean;
}

const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({ 
  onSendVoice,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  // Max recording time: 2 minutes (120 seconds)
  const MAX_RECORDING_TIME = 120;

  // Clear recording data when dismounting
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Start recording function
  const startRecording = async () => {
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
        setAudioBlob(audioBlob);
        setAudioUrl(url);
        
        // Stop all tracks from the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      setAudioBlob(null);
      setAudioUrl(null);
      
      // Set up timer
      let seconds = 0;
      timerRef.current = setInterval(() => {
        seconds++;
        setRecordingTime(seconds);
        
        // Stop recording after MAX_RECORDING_TIME seconds
        if (seconds >= MAX_RECORDING_TIME) {
          stopRecording();
          toast({
            title: "Recording limit reached",
            description: `Voice messages are limited to ${MAX_RECORDING_TIME} seconds.`,
            variant: "default"
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Access Denied",
        description: "Please allow microphone access to record voice messages.",
        variant: "destructive"
      });
    }
  };

  // Stop recording function
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  // Cancel recording function
  const cancelRecording = () => {
    if (isRecording) {
      stopRecording();
    }
    
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
  };

  // Send recorded message function
  const sendVoiceMessage = () => {
    if (audioBlob && audioUrl) {
      onSendVoice(audioUrl);
      setAudioBlob(null);
      setAudioUrl(null);
      setRecordingTime(0);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // If recording is in progress
  if (isRecording) {
    return (
      <div className="flex items-center space-x-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200 dark:border-red-800">
        <div className="w-6 h-6 flex-shrink-0 flex items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
        </div>
        <div className="flex-1 flex items-center justify-between">
          <span className="text-sm font-medium flex items-center">
            <Clock className="h-4 w-4 mr-1 text-red-500" />
            {formatTime(recordingTime)}
          </span>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={cancelRecording}
              className="h-8 w-8 p-0"
            >
              <Trash className="h-4 w-4 text-red-500" />
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={stopRecording}
              className="h-8 w-8 p-0 bg-red-500 hover:bg-red-600"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If we have a recorded audio to preview
  if (audioUrl) {
    return (
      <div className="flex items-center space-x-2 bg-muted p-2 rounded-lg">
        <audio src={audioUrl} controls className="flex-1 h-8" />
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={cancelRecording}
            className="h-8 w-8 p-0"
          >
            <Trash className="h-4 w-4" />
          </Button>
          <Button 
            variant="default" 
            size="sm" 
            onClick={sendVoiceMessage}
            className="h-8 w-8 p-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // Default state - record button
  return (
    <Button
      variant="ghost"
      size="icon"
      disabled={disabled}
      onClick={startRecording}
      className="rounded-full h-10 w-10 flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
    >
      <Mic className="h-5 w-5" />
    </Button>
  );
};

export default VoiceMessageRecorder;
