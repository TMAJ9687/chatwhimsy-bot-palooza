
import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';
import { useNicknameValidation } from '@/hooks/useNicknameValidation';
import { toast } from '@/hooks/use-toast';

const adjectives = [
  'Happy', 'Clever', 'Brave', 'Shiny', 'Witty', 
  'Calm', 'Swift', 'Smooth', 'Bright', 'Gentle',
  'Wild', 'Noble', 'Keen', 'Merry', 'Wise',
  'Lucky', 'Lively', 'Jolly', 'Mighty', 'Proud'
];

const nouns = [
  'Panda', 'Tiger', 'Dolphin', 'Eagle', 'Phoenix',
  'Voyager', 'Explorer', 'Wanderer', 'Knight', 'Pioneer',
  'Hawk', 'Wolf', 'Falcon', 'Lynx', 'Fox',
  'Raven', 'Panther', 'Dragon', 'Lion', 'Bear'
];

interface NicknameGeneratorProps {
  onNicknameSelected: (nickname: string) => void;
}

const NicknameGenerator: React.FC<NicknameGeneratorProps> = ({ onNicknameSelected }) => {
  const [nickname, setNickname] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const { checkNicknameAvailability, isChecking, isAvailable, reserveNickname } = useNicknameValidation();

  const generateRandomNickname = (): string => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const handleGenerateNickname = async () => {
    setIsGenerating(true);
    
    // Try up to 5 times to generate a unique nickname
    let attempts = 0;
    let newNickname = '';
    let available = false;
    
    while (attempts < 5 && !available) {
      newNickname = generateRandomNickname();
      // eslint-disable-next-line no-await-in-loop
      available = await checkNicknameAvailability(newNickname, false);
      attempts++;
    }
    
    if (available) {
      setNickname(newNickname);
    } else {
      // If we couldn't find an available nickname after 5 attempts, just use the last one
      setNickname(newNickname);
      toast({
        title: "Warning",
        description: "This nickname might not be available. Try generating another one.",
        variant: "destructive"
      });
    }
    
    setIsGenerating(false);
  };

  const handleContinue = async () => {
    if (nickname && !hasSelected && !isChecking) {
      // One final availability check before continuing
      const available = await checkNicknameAvailability(nickname, false);
      
      if (available) {
        // Reserve the nickname temporarily
        const reserved = await reserveNickname(nickname);
        
        if (reserved) {
          setHasSelected(true);
          onNicknameSelected(nickname);
        } else {
          toast({
            title: "Error",
            description: "Could not reserve nickname. Please try again.",
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Nickname Unavailable",
          description: "This nickname is no longer available. Please generate a new one.",
          variant: "destructive"
        });
      }
    }
  };

  // Generate a nickname on initial render
  useEffect(() => {
    handleGenerateNickname();
  }, []);

  return (
    <div className="animate-slide-up">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-semibold mb-2">Your Nickname</h2>
        <p className="text-muted-foreground">
          This is how others will see you. You can change it later.
        </p>
      </div>

      <div className="glass p-2 rounded-xl flex items-center justify-between mb-6">
        <div className="px-4 py-2 text-lg font-medium flex-1 text-center">{nickname}</div>
        <Button 
          variant="ghost" 
          size="sm"
          className="rounded-lg p-2 hover:bg-primary/10"
          onClick={handleGenerateNickname}
          isLoading={isGenerating || isChecking}
          icon={<RefreshCw className="h-5 w-5" />}
          aria-label="Generate new nickname"
        >
          Refresh
        </Button>
      </div>
      
      {isAvailable === false && nickname && (
        <div className="text-red-500 text-sm mb-4 text-center">
          This nickname is already taken. Please generate another one.
        </div>
      )}

      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon={<ArrowRight className="h-5 w-5" />}
        iconPosition="right"
        onClick={handleContinue}
        disabled={!nickname || isGenerating || isChecking || isAvailable === false || hasSelected}
        className="mt-2"
      >
        Continue
      </Button>
    </div>
  );
};

export default NicknameGenerator;
