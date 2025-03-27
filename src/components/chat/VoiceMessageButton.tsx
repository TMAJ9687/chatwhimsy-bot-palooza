
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Send } from 'lucide-react';
import { Button } from '../ui/button';

interface VoiceMessageButtonProps {
  onVoiceMessageReady: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

const VoiceMessageButton: React.FC<VoiceMessageButtonProps> = ({ 
  onVoiceMessageReady,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Clean up function for the recorder
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  // Start recording
  const startRecording = async () => {
    try {
      recordedChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(recordedChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
        // Don't automatically send here, allow user to send explicitly
      };
      
      // Start the recorder
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      // Set up timer for recording
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Handle clicking the record button
  const handleRecordClick = () => {
    if (disabled) return;
    
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
      setIsRecording(false);
    }
  };
  
  // Handle sending the voice message
  const handleSendVoiceMessage = () => {
    if (audioBlob && recordingTime > 0) {
      onVoiceMessageReady(audioBlob, recordingTime);
      setAudioBlob(null);
      setRecordingTime(0);
    }
  };
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopRecording();
    };
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="flex items-center">
      {isRecording ? (
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/20 rounded-full px-3 py-1">
          <span className="text-red-500 dark:text-red-400 text-sm font-medium animate-pulse">
            {formatTime(recordingTime)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
            onClick={handleRecordClick}
            disabled={disabled}
          >
            <Square className="h-4 w-4" />
          </Button>
        </div>
      ) : audioBlob ? (
        <div className="flex items-center gap-2 bg-teal-100 dark:bg-teal-900/20 rounded-full px-3 py-1">
          <span className="text-teal-600 dark:text-teal-400 text-sm font-medium">
            {formatTime(recordingTime)}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
            onClick={handleSendVoiceMessage}
            disabled={disabled}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={handleRecordClick}
          disabled={disabled}
          title="Record voice message"
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

export default VoiceMessageButton;
