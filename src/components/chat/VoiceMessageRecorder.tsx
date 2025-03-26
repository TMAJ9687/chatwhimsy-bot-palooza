
import React, { useState, useRef } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { validateVoiceMessage } from '@/utils/messageUtils';

interface VoiceMessageRecorderProps {
  onSend: (audioBlob: Blob) => void;
  onCancel: () => void;
  isRecording: boolean;
  setIsRecording: (recording: boolean) => void;
  voiceMessagesRemaining: number;
  isVip: boolean;
}

const VoiceMessageRecorder: React.FC<VoiceMessageRecorderProps> = ({
  onSend,
  onCancel,
  isRecording,
  setIsRecording,
  voiceMessagesRemaining,
  isVip
}) => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const { toast } = useToast();
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const startRecording = async () => {
    if (voiceMessagesRemaining <= 0 && !isVip) {
      toast({
        title: "Voice message limit reached",
        description: "You have reached your daily voice message limit. Upgrade to VIP for unlimited voice messages."
      });
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        
        // Stop all tracks in the stream
        stream.getTracks().forEach(track => track.stop());
      };
      
      // Start recording
      mediaRecorder.start(10);
      setIsRecording(true);
      
      // Start timer
      let seconds = 0;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        
        // Check if we've hit the 2-minute limit
        if (seconds >= 120) {
          stopRecording();
          toast({
            title: "Recording limit reached",
            description: "Voice messages are limited to 2 minutes"
          });
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record voice messages",
        variant: "destructive"
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const pauseRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      
      // Pause timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };
  
  const resumeRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'paused') {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      
      // Resume timer
      let seconds = recordingDuration;
      timerRef.current = window.setInterval(() => {
        seconds += 1;
        setRecordingDuration(seconds);
        
        // Check if we've hit the 2-minute limit
        if (seconds >= 120) {
          stopRecording();
          toast({
            title: "Recording limit reached",
            description: "Voice messages are limited to 2 minutes"
          });
        }
      }, 1000);
    }
  };
  
  const cancelRecording = () => {
    // Stop recording if still active
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks in the stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    // Reset state
    setAudioBlob(null);
    setRecordingDuration(0);
    setIsRecording(false);
    setIsPaused(false);
    
    // Call parent cancel handler
    onCancel();
  };
  
  const handleSend = () => {
    if (audioBlob) {
      const validation = validateVoiceMessage(recordingDuration);
      if (!validation.valid) {
        toast({
          title: "Invalid voice message",
          description: validation.message
        });
        return;
      }
      
      onSend(audioBlob);
      
      // Reset state
      setAudioBlob(null);
      setRecordingDuration(0);
      setIsRecording(false);
      setIsPaused(false);
    }
  };
  
  return (
    <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 rounded-md">
      {isRecording ? (
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
            <span className="font-mono">{formatTime(recordingDuration)}</span>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={isPaused ? resumeRecording : pauseRecording}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={stopRecording}
            >
              Stop
            </Button>
            
            <Button
              size="sm"
              variant="destructive"
              onClick={cancelRecording}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : audioBlob ? (
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <audio controls className="w-full">
              <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
              Your browser does not support the audio element.
            </audio>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="destructive"
              onClick={cancelRecording}
            >
              <X className="h-4 w-4" />
            </Button>
            
            <Button
              size="sm"
              variant="default"
              onClick={handleSend}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
            onClick={startRecording}
          >
            <Mic className="h-5 w-5 mr-2" />
            {isVip ? 'Record voice message' : `Record voice message (${voiceMessagesRemaining} remaining)`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceMessageRecorder;
