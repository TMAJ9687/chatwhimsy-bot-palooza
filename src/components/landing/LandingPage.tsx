import React, { useState, useEffect } from 'react';
import { Crown, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import Button from '../shared/Button';
import ProfileSetup from '../profile/ProfileSetup';
import { useUser } from '../../context/UserContext';
import ThemeToggle from '../shared/ThemeToggle';
import { useDialog } from '@/context/DialogContext';
import { DialogType } from '@/context/DialogContext';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile, user } = useUser();
  let openDialog: (type: DialogType, data?: Record<string, any>) => void = 
    () => console.log('Dialog context not available');
  
  try {
    const dialogContext = useDialog();
    openDialog = dialogContext.openDialog;
  } catch (error) {
    console.error('Dialog context not available:', error);
  }
  
  const [step, setStep] = useState<'nickname' | 'profile'>('nickname');
  const [nickname, setNickname] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [navigationInProgress, setNavigationInProgress] = useState(false);

  const validateNickname = (value: string): boolean => {
    if (value.length > 16) {
      setNicknameError('Nickname must be 16 characters or less');
      return false;
    }
    
    for (let i = 0; i < value.length - 2; i++) {
      if (value[i] === value[i + 1] && value[i] === value[i + 2]) {
        setNicknameError('Cannot use more than 2 identical characters in a row');
        return false;
      }
    }
    
    setNicknameError('');
    return true;
  };

  const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    if (newValue.length >= 3) {
      const lastChar = newValue[newValue.length - 1];
      const secondLastChar = newValue[newValue.length - 2];
      const thirdLastChar = newValue[newValue.length - 3];
      
      if (lastChar === secondLastChar && lastChar === thirdLastChar) {
        setNicknameError('Cannot use more than 2 identical characters in a row');
        return;
      }
    }
    
    setNickname(newValue);
    validateNickname(newValue);
  };

  const handleNicknameSelected = (selectedNickname: string) => {
    if (validateNickname(selectedNickname)) {
      setNickname(selectedNickname);
      updateUserProfile({ nickname: selectedNickname });
      setStep('profile');
    }
  };

  const handleProfileComplete = (profile: {
    gender: string;
    age: number;
    country: string;
    interests: string[];
    isVip: boolean;
  }) => {
    if (navigationInProgress) {
      console.log('Navigation already in progress, ignoring duplicate request');
      return;
    }

    console.log('Profile setup complete, saving data with isVip:', profile.isVip);
    setNavigationInProgress(true);
    
    updateUserProfile({
      gender: profile.gender as any,
      age: profile.age,
      country: profile.country,
      interests: profile.interests,
      isVip: profile.isVip === true ? true : false,
    });
    
    setTimeout(() => {
      console.log('Navigating to chat from LandingPage');
      navigate('/chat');
    }, 50);
  };
  
  const generateRandomNickname = () => {
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
    
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNumber = Math.floor(Math.random() * 100);
    const generatedNickname = `${randomAdjective}${randomNoun}${randomNumber}`;
    
    setNicknameError('');
    return generatedNickname;
  };
  
  const handleStartChat = () => {
    if (nickname && !nicknameError) {
      setStep('profile');
    } else if (!nickname) {
      const randomNickname = generateRandomNickname();
      setNickname(randomNickname);
      updateUserProfile({ nickname: randomNickname });
      setStep('profile');
    }
  };

  const handleVipClick = () => {
    try {
      openDialog('vipSelect');
    } catch (error) {
      console.error('Failed to open dialog:', error);
      navigate('/vip-signup');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background dark:from-background dark:to-background">
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Button
            variant="primary" 
            size="sm"
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-md py-2 px-6 flex items-center gap-2"
            onClick={handleVipClick}
          >
            <Crown className="h-4 w-4" />
            VIP
          </Button>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-6">
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:text-left mb-6 md:mb-0">
          <div className="max-w-lg">
            <div className="flex justify-center md:justify-start space-x-8">
              <div className="w-20 h-20 bg-secondary rounded-full animate-[bounce_3s_ease-in-out_infinite]" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-20 h-20 bg-primary rounded-full animate-[bounce_3.2s_ease-in-out_infinite]" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-20 h-20 bg-accent rounded-full animate-[bounce_2.8s_ease-in-out_infinite]" style={{ animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col items-center">
          <div className="bg-card text-card-foreground rounded-3xl shadow-lg p-8 max-w-md w-full mb-6">
            {step === 'nickname' ? (
              <div>
                <div className="text-center mb-8">
                  <h1 className="text-4xl font-bold mb-4">Text <span className="text-secondary">Anonymously</span></h1>
                  <h2 className="text-4xl font-bold mb-6">with <span className="text-primary">no registration</span></h2>
                  <p className="text-muted-foreground">
                    Unleash your creativity and connect with like-minded individuals 
                    on our chatting website, where conversations come to life.
                  </p>
                </div>
                
                <div className="relative mb-6">
                  <div className="flex items-center justify-between bg-input rounded-lg p-2">
                    <input
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      className="px-4 py-2 text-lg font-medium flex-1 bg-transparent outline-none text-foreground"
                      placeholder="Enter a nickname"
                      maxLength={16}
                    />
                    <div className="absolute right-16 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      {nickname.length}/16
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-lg p-2 hover:bg-primary/10"
                      onClick={() => {
                        const newNickname = generateRandomNickname();
                        setNickname(newNickname);
                      }}
                      aria-label="Generate new nickname"
                    >
                      <RefreshCw className="h-5 w-5" />
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </div>
                  {nicknameError && (
                    <div className="text-destructive text-sm mt-1">{nicknameError}</div>
                  )}
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="bg-secondary text-white font-semibold py-3 rounded-lg w-full"
                  onClick={handleStartChat}
                  disabled={!!nicknameError}
                >
                  Start Chat
                </Button>
              </div>
            ) : (
              <ProfileSetup 
                nickname={nickname} 
                onComplete={handleProfileComplete} 
              />
            )}
          </div>
          
          <div className="w-full max-w-md p-4 mb-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
            <div className="h-20 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
              Google AdSense Placeholder
            </div>
          </div>
        </div>
      </main>

      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
