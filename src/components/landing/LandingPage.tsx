
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
    return `${randomAdjective}${randomNoun}${randomNumber}`;
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
    document.documentElement.classList.toggle('dark');
  };

  // Apply dark mode on initial load if needed
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#edf4f7] to-[#d9e6f2]">
      {/* Header */}
      <header className="py-6 px-8 flex justify-between items-center">
        <Logo variant="image" />
        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Switch 
              checked={isDarkMode}
              onCheckedChange={toggleDarkMode}
            />
            <Moon className="h-4 w-4" />
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
            <div className="flex justify-center md:justify-start space-x-6 mt-8">
              <div className="w-16 h-16 bg-secondary rounded-full animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.1s' }}></div>
              <div className="w-16 h-16 bg-primary rounded-full animate-bounce" style={{ animationDuration: '2.2s', animationDelay: '0.2s' }}></div>
              <div className="w-16 h-16 bg-accent rounded-full animate-bounce" style={{ animationDuration: '1.8s', animationDelay: '0.3s' }}></div>
            </div>
          </div>
        </div>

        {/* Right column: Chat card */}
        <div className="w-full md:w-1/2 flex justify-center">
          <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">Text <span className="text-secondary">Anonymously</span></h1>
              <h2 className="text-4xl font-bold mb-6">with <span className="text-primary">no registration</span></h2>
              <p className="text-gray-600">
                Unleash your creativity and connect with like-minded individuals 
                on our chatting website, where conversations come to life.
              </p>
            </div>
            
            {step === 'nickname' ? (
              <div>
                <div className="relative mb-4">
                  <div className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                    <input
                      type="text"
                      value={nickname}
                      onChange={handleNicknameChange}
                      className="px-4 py-2 text-lg font-medium flex-1 bg-transparent outline-none"
                      placeholder="Enter a nickname"
                      maxLength={16}
                    />
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
                  <div className="absolute top-0 right-16 text-sm text-gray-500 mt-2">{nickname.length}/16</div>
                  {nicknameError && (
                    <div className="text-red-500 text-sm mt-1">{nicknameError}</div>
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
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>&copy; {new Date().getFullYear()} chatwii. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
