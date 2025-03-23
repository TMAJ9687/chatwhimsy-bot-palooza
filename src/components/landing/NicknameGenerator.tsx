
import React, { useState, useEffect } from 'react';
import { ArrowRight, RefreshCw } from 'lucide-react';
import Button from '../shared/Button';

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

  const generateRandomNickname = (): string => {
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    return `${randomAdjective}${randomNoun}${randomNumber}`;
  };

  const handleGenerateNickname = () => {
    setIsGenerating(true);
    
    // Simulate a brief delay for animation effect
    setTimeout(() => {
      setNickname(generateRandomNickname());
      setIsGenerating(false);
    }, 300);
  };

  const handleContinue = () => {
    if (nickname) {
      onNicknameSelected(nickname);
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
          isLoading={isGenerating}
          icon={<RefreshCw className="h-5 w-5" />}
          aria-label="Generate new nickname"
        />
      </div>

      <Button
        variant="primary"
        fullWidth
        size="lg"
        icon={<ArrowRight className="h-5 w-5" />}
        iconPosition="right"
        onClick={handleContinue}
        disabled={!nickname || isGenerating}
        className="mt-2"
      >
        Continue
      </Button>
    </div>
  );
};

export default NicknameGenerator;
