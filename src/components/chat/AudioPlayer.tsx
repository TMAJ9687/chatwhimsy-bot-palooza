
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Volume1, VolumeX } from 'lucide-react';
import { Button } from '../ui/button';
import { Slider } from '../ui/slider';

interface AudioPlayerProps {
  src: string;
  duration?: number;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ src, duration }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(duration || 0);
  const [volume, setVolume] = useState(0.5);
  const [showVolumeControl, setShowVolumeControl] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(src);
      
      // Set volume initially
      audioRef.current.volume = volume;
      
      // Listen for duration change if not provided
      if (!duration) {
        audioRef.current.onloadedmetadata = () => {
          if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
          }
        };
      }
      
      // Update current time
      audioRef.current.ontimeupdate = () => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime);
        }
      };
      
      // Handle audio end
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [src, duration]);
  
  // Update volume when it changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);
  
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
  };
  
  const handleTimeChange = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const VolumeIcon = () => {
    if (volume === 0) return <VolumeX size={16} />;
    if (volume < 0.5) return <Volume1 size={16} />;
    return <Volume2 size={16} />;
  };
  
  return (
    <div className="flex flex-col w-full max-w-[240px] bg-gray-100 dark:bg-gray-800 rounded-lg p-2">
      <div className="flex items-center space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 rounded-full"
          onClick={togglePlayPause}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </Button>
        
        <div className="flex-1">
          <Slider
            value={[currentTime]}
            min={0}
            max={audioDuration || 100}
            step={0.1}
            onValueChange={handleTimeChange}
            className="w-full"
          />
        </div>
        
        <div className="relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full"
            onClick={() => setShowVolumeControl(!showVolumeControl)}
          >
            <VolumeIcon />
          </Button>
          
          {showVolumeControl && (
            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white dark:bg-gray-950 rounded-lg shadow-lg w-8 h-28 flex flex-col items-center">
              <Slider
                value={[volume]}
                min={0}
                max={1}
                step={0.01}
                onValueChange={handleVolumeChange}
                orientation="vertical"
                className="h-20 mx-auto"
              />
            </div>
          )}
        </div>
      </div>
      
      <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1 px-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(audioDuration)}</span>
      </div>
    </div>
  );
};

export default AudioPlayer;
