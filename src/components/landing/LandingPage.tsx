
import React, { useState, useEffect } from 'react';
import { ArrowRight, Crown, RefreshCw, Star, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Logo from '../shared/Logo';
import Button from '../shared/Button';
import ProfileSetup from '../profile/ProfileSetup';
import { useUser } from '../../context/UserContext';
import { Switch } from "../ui/switch";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUserProfile } = useUser();
  const [step, setStep] = useState<'nickname' | 'profile'>('nickname');
  const [nickname, setNickname] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [nicknameError, setNicknameError] = useState('');

  // Function to validate nickname input
  const validateNickname = (value: string): boolean => {
    if (value.length > 16) {
      setNicknameError('Nickname must be 16 characters or less');
      return false;
    }
    
    // Check for more than 2 consecutive identical characters
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
    
    // Check if the last 3 characters would form a repetition
    if (newValue.length >= 3) {
      const lastChar = newValue[newValue.length - 1];
      const secondLastChar = newValue[newValue.length - 2];
      const thirdLastChar = newValue[newValue.length - 3];
      
      if (lastChar === secondLastChar && lastChar === thirdLastChar) {
        setNicknameError('Cannot use more than 2 identical characters in a row');
        return;
      }
    }
    
    if (validateNickname(newValue)) {
      setNickname(newValue);
    }
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
  }) => {
    updateUserProfile({
      gender: profile.gender as any,
      age: profile.age,
      country: profile.country,
      interests: profile.interests,
    });
    
    navigate('/chat');
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
    const newNickname = `${randomAdjective}${randomNoun}${randomNumber}`;
    
    // Clear any previous errors when generating a new nickname
    setNicknameError('');
    return newNickname;
  };
  
  const handleStartChat = () => {
    if (nickname) {
      setStep('profile');
    } else {
      // Generate nickname and then move to profile step
      const randomNickname = generateRandomNickname();
      setNickname(randomNickname);
      updateUserProfile({ nickname: randomNickname });
      setStep('profile');
    }
  };
  
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    // Toggle dark mode class on document
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Apply dark mode on initial load if needed
  useEffect(() => {
    // Check if user has a preference in localStorage or prefers dark scheme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedTheme = localStorage.getItem('theme');
    
    if (storedTheme === 'dark' || (!storedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  // Save theme preference when it changes
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#edf4f7] to-[#d9e6f2] dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-300">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4 dark:text-gray-400 text-amber-500" />
            <Switch 
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
            <Moon className="h-4 w-4 dark:text-white text-gray-400" />
          </div>
          <Button
            variant="primary" 
            size="sm"
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded-md py-2 px-6 flex items-center gap-2"
          >
            <Crown className="h-4 w-4" />
            VIP
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-12">
        {/* Left column with animated circles */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center md:text-left mb-12 md:mb-0">
          <div className="max-w-lg">
            <div className="flex justify-center md:justify-start space-x-8 mt-8">
              <div className="w-20 h-20 bg-secondary rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.1s' }}></div>
              <div className="w-20 h-20 bg-primary rounded-full animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.2s' }}></div>
              <div className="w-20 h-20 bg-accent rounded-full animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>

        {/* Right column: Chat card */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 max-w-md w-full dark:border dark:border-gray-700">
            {step === 'nickname' ? (
              <div>
                <div className="relative mb-4">
                  <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-700 rounded-lg p-2">
                    <input
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      className="px-4 py-2 text-lg font-medium flex-1 bg-transparent outline-none dark:text-white"
                      placeholder="Enter a nickname"
                      maxLength={16}
                    />
                    <div className="absolute top-0 right-16 text-sm text-gray-500 dark:text-gray-400 mt-2">{nickname.length}/16</div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="rounded-lg p-2 hover:bg-primary/10"
                      onClick={() => setNickname(generateRandomNickname())}
                      icon={<RefreshCw className="h-5 w-5" />}
                      aria-label="Generate new nickname"
                    >
                      <span className="sr-only">Refresh</span>
                    </Button>
                  </div>
                  {nicknameError && (
                    <div className="text-red-500 text-sm mt-1">{nicknameError}</div>
                  )}
                </div>
                
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  className="bg-secondary text-white font-semibold py-3 rounded-lg w-full dark:bg-secondary/80"
                  onClick={handleStartChat}
                  disabled={!!nicknameError || !nickname}
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border dark:border-gray-700">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
