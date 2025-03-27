
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send, Timer } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onSendVoice: (audioBlob: Blob) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSendVoice, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  
  const MAX_RECORDING_TIME = 120; // 2 minutes in seconds
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all audio tracks
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Reset timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= MAX_RECORDING_TIME) {
            stopRecording();
            return MAX_RECORDING_TIME;
          }
          return prev + 1;
        });
      }, 1000);
      
      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Unable to access your microphone. Please check your settings.",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Clear the audio chunks
      audioChunksRef.current = [];
      setAudioBlob(null);
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };
  
  const handleSendVoice = () => {
    if (audioBlob) {
      onSendVoice(audioBlob);
      setAudioBlob(null);
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300" 
          disabled={disabled}
          title="Voice message"
        >
          <Mic className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4" align="start">
        <div className="space-y-4">
          <div className="text-center font-medium">
            {isRecording ? (
              <div className="flex items-center justify-center text-red-500 animate-pulse">
                <Timer className="h-4 w-4 mr-2" />
                Recording: {formatTime(recordingTime)}
              </div>
            ) : audioBlob ? (
              <div className="text-green-600">Voice message ready to send</div>
            ) : (
              <div>Click to start recording</div>
            )}
          </div>
          
          <div className="flex justify-center">
            {isRecording ? (
              <Button 
                variant="destructive"
                className="rounded-full px-4"
                onClick={stopRecording}
              >
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            ) : audioBlob ? (
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={() => {
                    setAudioBlob(null);
                    audioChunksRef.current = [];
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  variant="default"
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={handleSendVoice}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Send
                </Button>
              </div>
            ) : (
              <Button 
                variant="default"
                className="rounded-full bg-amber-500 hover:bg-amber-600"
                onClick={startRecording}
              >
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            )}
          </div>
          
          <div className="text-xs text-center text-gray-500">
            Maximum recording time: 2 minutes
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default VoiceRecorder;
